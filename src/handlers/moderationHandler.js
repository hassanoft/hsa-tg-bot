// Modération automatique de groupe : antilink, antibadword, antiflood,
// antispam. S'applique à TOUS les messages d'un groupe (pas seulement aux
// commandes). Nécessite que H$Λ BOT soit administrateur du groupe pour
// pouvoir supprimer les messages fautifs.

import { db } from '../database/database.js';
import { logger } from '../utils/logger.js';
import { formatMention } from '../utils/helpers.js';

const log = logger.child({ class: 'moderation' });

const LINK_REGEX = /(https?:\/\/|t\.me\/|telegram\.me\/)[^\s]+/i;

// Fenêtres glissantes en mémoire pour antiflood / antispam
const floodTracker = new Map(); // `${group}:${user}` -> timestamps[]
const spamTracker = new Map(); // `${group}:${user}` -> { lastText, count }

const FLOOD_WINDOW_MS = 8000;
const FLOOD_MAX_MESSAGES = 6;
const SPAM_REPEAT_THRESHOLD = 4;

async function deleteAndWarn(bot, ctx, reason) {
  const { chatId, senderId, msg, pushName } = ctx;
  try {
    if (ctx.isBotGroupAdmin) {
      await bot.sendMessage(chatId, { delete: { id: msg.message_id } });
    }
  } catch (err) {
    log.warn('Suppression du message impossible (droits admin manquants ?)', err.message);
  }

  const settings = db.getGroupSettings(chatId);
  const warnings = db.addWarning(chatId, senderId, reason);
  const limit = settings.warnLimit || 3;

  await bot.sendMessage(chatId, {
    text: `⚠️ ${formatMention(senderId, pushName)} : ${reason}\n⚠️ Avertissement : ${warnings.length}/${limit}`,
    parse_mode: 'HTML',
  });

  if (warnings.length >= limit && ctx.isBotGroupAdmin) {
    try {
      await bot.groupParticipantsUpdate(chatId, [senderId], 'remove');
      db.clearWarnings(chatId, senderId);
      await bot.sendMessage(chatId, {
        text: `🚫 ${formatMention(senderId, pushName)} a été exclu (limite d'avertissements atteinte).`,
        parse_mode: 'HTML',
      });
    } catch (err) {
      log.warn('Exclusion automatique impossible', err.message);
    }
  }
}

/** À appeler pour chaque message reçu dans un groupe. Retourne true si le message a été traité (supprimé). */
export async function runGroupModeration(bot, ctx) {
  const { isGroup, senderId, text, isSenderGroupAdmin, isOwner } = ctx;
  if (!isGroup) return false;
  if (isSenderGroupAdmin || isOwner) return false; // les admins/owner ne sont jamais modérés
  if (!text) return false;

  const settings = db.getGroupSettings(ctx.chatId);

  // --- ANTILINK ---
  if (settings.antilink && LINK_REGEX.test(text)) {
    const whitelisted = (settings.antilinkWhitelist || []).some((w) => text.includes(w));
    if (!whitelisted) {
      await deleteAndWarn(bot, ctx, 'Envoi de lien non autorisé.');
      return true;
    }
  }

  // --- ANTIBADWORD ---
  if (settings.antibadword && (settings.antibadwordList || []).length) {
    const lower = text.toLowerCase();
    const hit = settings.antibadwordList.find((w) => lower.includes(w.toLowerCase()));
    if (hit) {
      await deleteAndWarn(bot, ctx, 'Langage inapproprié détecté.');
      return true;
    }
  }

  // --- ANTIFLOOD (trop de messages en peu de temps) ---
  if (settings.antiflood) {
    const key = `${ctx.chatId}:${senderId}`;
    const now = Date.now();
    const list = (floodTracker.get(key) || []).filter((t) => now - t < FLOOD_WINDOW_MS);
    list.push(now);
    floodTracker.set(key, list);
    if (list.length > FLOOD_MAX_MESSAGES) {
      floodTracker.set(key, []);
      await deleteAndWarn(bot, ctx, 'Flood détecté (trop de messages).');
      return true;
    }
  }

  // --- ANTISPAM (même message répété) ---
  if (settings.antispam) {
    const key = `${ctx.chatId}:${senderId}`;
    const prev = spamTracker.get(key);
    if (prev && prev.lastText === text) {
      prev.count += 1;
    } else {
      spamTracker.set(key, { lastText: text, count: 1 });
    }
    const entry = spamTracker.get(key);
    if (entry.count >= SPAM_REPEAT_THRESHOLD) {
      spamTracker.set(key, { lastText: text, count: 0 });
      await deleteAndWarn(bot, ctx, 'Message répété (spam).');
      return true;
    }
  }

  return false;
}

/** @param {{id: string, name: string}} user */
export async function sendWelcome(bot, groupId, user) {
  const settings = db.getGroupSettings(groupId);
  if (!settings.welcome) return;
  const template = settings.welcomeMessage || 'Bienvenue @user dans le groupe ! 👋';
  const text = template.replace('@user', formatMention(user.id, user.name));
  await bot.sendMessage(groupId, { text, parse_mode: 'HTML' });
}

/** @param {{id: string, name: string}} user */
export async function sendGoodbye(bot, groupId, user) {
  const settings = db.getGroupSettings(groupId);
  if (!settings.goodbye) return;
  const template = settings.goodbyeMessage || 'Au revoir @user 👋';
  const text = template.replace('@user', formatMention(user.id, user.name));
  await bot.sendMessage(groupId, { text, parse_mode: 'HTML' });
}
