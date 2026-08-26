import { db } from '../database/database.js';
import { logger } from '../utils/logger.js';
import { getPrefix } from '../utils/prefixStore.js';
import { checkOwner, checkBotAdmin } from '../utils/permissions.js';
import { dispatchCommand } from './commandHandler.js';
import { tryHandleContactFlow } from './contactHandler.js';
import { runGroupModeration, sendWelcome, sendGoodbye } from './moderationHandler.js';

const log = logger.child({ class: 'messageHandler' });

const groupMetaCache = new Map(); // chatId -> { data, expiresAt }
const GROUP_META_TTL_MS = 30_000;

export async function getGroupMetadataCached(bot, chatId) {
  const cached = groupMetaCache.get(chatId);
  if (cached && cached.expiresAt > Date.now()) return cached.data;
  try {
    const data = await bot.groupMetadata(chatId);
    groupMetaCache.set(chatId, { data, expiresAt: Date.now() + GROUP_META_TTL_MS });
    return data;
  } catch (err) {
    log.warn(`Impossible de récupérer les métadonnées du groupe ${chatId}`, err.message);
    return null;
  }
}

export function invalidateGroupMetadata(chatId) {
  groupMetaCache.delete(chatId);
}

const ADMIN_STATUSES = new Set(['creator', 'administrator']);

export async function handleIncomingMessage(bot, msg) {
  try {
    // --- Arrivée / départ de membres (messages système Telegram) ---
    if (msg.new_chat_members?.length || msg.left_chat_member) {
      const chatId = String(msg.chat.id);
      invalidateGroupMetadata(chatId);
      if (msg.new_chat_members?.length) {
        for (const member of msg.new_chat_members) {
          if (member.is_bot && String(member.id) === bot.user.id) continue; // le bot lui-même rejoint le groupe
          await sendWelcome(bot, chatId, { id: String(member.id), name: member.first_name }).catch(() => {});
        }
      }
      if (msg.left_chat_member && String(msg.left_chat_member.id) !== bot.user.id) {
        await sendGoodbye(bot, chatId, { id: String(msg.left_chat_member.id), name: msg.left_chat_member.first_name }).catch(() => {});
      }
      return;
    }

    if (!msg.from) return; // messages de canal sans auteur, etc.

    await handleUserMessage(bot, msg);
  } catch (err) {
    log.error('Erreur non gérée dans le traitement du message', err.message, err.stack);
  }
}

async function handleUserMessage(bot, msg) {
  const chatId = String(msg.chat.id);
  const isGroup = msg.chat.type === 'group' || msg.chat.type === 'supergroup';
  const senderId = String(msg.from.id);
  const text = (msg.text || msg.caption || '').trim();
  const pushName = msg.from.first_name || msg.from.username || senderId;

  db.touchUser(senderId, { name: pushName, username: msg.from.username });
  if (isGroup) db.trackGroupMember(chatId, senderId, pushName);

  const groupMetadata = isGroup ? await getGroupMetadataCached(bot, chatId) : null;
  if (isGroup) db.touchGroup(chatId, { name: groupMetadata?.subject });

  const isOwner = checkOwner(senderId);
  const isBotAdmin = checkBotAdmin(senderId);

  let isSenderGroupAdmin = false;
  let isBotGroupAdmin = false;
  if (isGroup) {
    const [senderStatus, botStatus] = await Promise.all([
      bot.getChatMemberStatus(chatId, senderId),
      bot.getChatMemberStatus(chatId, bot.user.id),
    ]);
    isSenderGroupAdmin = ADMIN_STATUSES.has(senderStatus);
    isBotGroupAdmin = ADMIN_STATUSES.has(botStatus);
  }

  const prefix = getPrefix();

  const reply = async (content) => {
    const payload = typeof content === 'string' ? { text: content } : content;
    return bot.sendMessage(chatId, payload, { quoted: msg });
  };

  const ctx = {
    bot,
    msg,
    chatId,
    isGroup,
    groupMetadata,
    senderId,
    pushName,
    text,
    isOwner,
    isBotAdmin,
    isSenderGroupAdmin,
    isBotGroupAdmin,
    prefix,
    reply,
    db,
  };

  // --- Lecture automatique (sans effet visible côté Telegram, voir telegramBot.js) ---
  if (isGroup) {
    const settings = db.getGroupSettings(chatId);
    if (settings.autoread) bot.readMessages([msg]).catch(() => {});
  }

  // --- Système /contact (réponse OWNER ou contenu en attente) ---
  const handledByContact = await tryHandleContactFlow(bot, ctx);
  if (handledByContact) return;

  // --- Modération automatique de groupe ---
  if (isGroup) {
    const moderated = await runGroupModeration(bot, ctx);
    if (moderated) return;
  }

  // --- Commandes (préfixe obligatoire) ---
  if (!text || !text.startsWith(prefix)) return; // aucune réponse sans préfixe

  const withoutPrefix = text.slice(prefix.length).trim();
  if (!withoutPrefix) return;

  const [rawCommand, ...rest] = withoutPrefix.split(/\s+/);
  // Telegram ajoute parfois "@NomDuBot" au nom de la commande dans les groupes (ex: /help@MonBot)
  const commandName = rawCommand.split('@')[0].toLowerCase();
  const args = rest;

  ctx.commandName = commandName;
  ctx.args = args;
  ctx.text = args.join(' ');

  if (isGroup) {
    const settings = db.getGroupSettings(chatId);
    if (settings.autotyping) bot.sendPresenceUpdate('composing', chatId).catch(() => {});
    if (settings.autorecording) bot.sendPresenceUpdate('recording', chatId).catch(() => {});
  }

  await dispatchCommand(ctx);
}
