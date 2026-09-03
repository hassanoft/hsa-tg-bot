// Adaptateur Telegram.
//
// Objectif : exposer une interface proche de celle qu'utilisaient les
// commandes H$Λ BOT (héritée de la version WhatsApp/Baileys), pour que la
// quasi-totalité des ~145 commandes (calculatrice, IA, image, vidéo, audio,
// utilitaires, fun...) fonctionnent SANS modification. Seules les commandes
// réellement spécifiques à la structure d'un groupe (kick/promote/tagall...)
// ont été réécrites pour respecter les contraintes propres à l'API Bot
// Telegram (voir commentaires "LIMITATION TELEGRAM" ci-dessous).
//
// Ce fichier est le SEUL endroit qui parle directement à node-telegram-bot-api.

import TelegramBot from 'node-telegram-bot-api';
import { logger } from '../utils/logger.js';

const log = logger.child({ class: 'telegramBot' });

function resolveMediaInput(value) {
  if (Buffer.isBuffer(value)) return value;
  if (value && typeof value === 'object' && value.url) return value.url;
  return value;
}

function presenceToChatAction(action) {
  if (action === 'composing') return 'typing';
  if (action === 'recording') return 'record_voice';
  return 'typing';
}

export class TelegramAdapter {
  constructor(token) {
    this.raw = new TelegramBot(token, { polling: true });
    this.user = null; // renseigné après getMe(), voir connectionHandler.js
  }

  // ---------------------------------------------------------------------
  // Envoi de message — dispatch selon le "type" de contenu, à la manière
  // du payload Baileys ({ text }, { image }, { video }, { audio, ptt },
  // { sticker }, { document }, { contacts }, { delete }, { edit }).
  // ---------------------------------------------------------------------
  async sendMessage(chatId, content, opts = {}) {
    const options = {};
    if (opts.quoted?.message_id) options.reply_to_message_id = opts.quoted.message_id;
    if (content.parse_mode) options.parse_mode = content.parse_mode;

    // --- Suppression d'un message ---
    if (content.delete) {
      await this.raw.deleteMessage(chatId, content.delete.id);
      return { key: { id: content.delete.id, remoteJid: String(chatId) } };
    }

    // --- Édition d'un message existant ---
    if (content.edit) {
      const msg = await this.raw.editMessageText(content.text, {
        chat_id: chatId,
        message_id: content.edit.id,
      });
      const id = typeof msg === 'object' ? msg.message_id : content.edit.id;
      return { key: { id, remoteJid: String(chatId) } };
    }

    // --- Contact (vCard) : repli sur un simple message texte ---
    if (content.contacts) {
      const c = content.contacts.contacts?.[0];
      const phoneMatch = c?.vcard?.match(/waid=(\d+)/);
      const text = phoneMatch ? `👑 Contact : +${phoneMatch[1]}` : (content.contacts.displayName || 'Contact');
      const msg = await this.raw.sendMessage(chatId, text, options);
      return { key: { id: msg.message_id, remoteJid: String(chatId) } };
    }

    let msg;
    if (content.image !== undefined) {
      msg = await this.raw.sendPhoto(chatId, resolveMediaInput(content.image), {
        ...options,
        caption: content.caption,
      });
    } else if (content.sticker !== undefined) {
      msg = await this.raw.sendSticker(chatId, resolveMediaInput(content.sticker), options);
    } else if (content.video !== undefined) {
      if (content.gifPlayback) {
        msg = await this.raw.sendAnimation(chatId, resolveMediaInput(content.video), {
          ...options,
          caption: content.caption,
        });
      } else {
        msg = await this.raw.sendVideo(
          chatId,
          resolveMediaInput(content.video),
          { ...options, caption: content.caption },
          content.mimetype ? { contentType: content.mimetype } : {}
        );
      }
    } else if (content.audio !== undefined) {
      if (content.ptt) {
        msg = await this.raw.sendVoice(chatId, resolveMediaInput(content.audio), options);
      } else {
        msg = await this.raw.sendAudio(
          chatId,
          resolveMediaInput(content.audio),
          options,
          content.mimetype ? { contentType: content.mimetype } : {}
        );
      }
    } else if (content.document !== undefined) {
      msg = await this.raw.sendDocument(
        chatId,
        resolveMediaInput(content.document),
        { ...options, caption: content.caption },
        {
          filename: content.fileName || 'fichier',
          contentType: content.mimetype || 'application/octet-stream',
        }
      );
    } else if (content.text !== undefined) {
      msg = await this.raw.sendMessage(chatId, content.text, options);
    } else if (content.dice !== undefined) {
      // Jeu animé natif Telegram (🎲 🎯 🏀 ⚽ 🎳 🎰) : la valeur du résultat
      // est déterminée par Telegram lui-même, jamais par le bot.
      msg = await this.raw.sendDice(chatId, { ...options, emoji: content.dice });
    } else {
      throw new Error('Contenu de message non pris en charge par TelegramAdapter.');
    }

    return { key: { id: msg.message_id, remoteJid: String(chatId), diceValue: msg.dice?.value } };
  }

  // ---------------------------------------------------------------------
  // Métadonnées de groupe.
  // LIMITATION TELEGRAM : l'API Bot ne permet PAS de lister tous les
  // membres d'un groupe (contrairement à Baileys sur WhatsApp) — seule la
  // liste des administrateurs est accessible. `participants` ne contient
  // donc que les administrateurs ; `memberCount` donne le total réel.
  // ---------------------------------------------------------------------
  async groupMetadata(chatId) {
    const [chat, admins, memberCount] = await Promise.all([
      this.raw.getChat(chatId),
      this.raw.getChatAdministrators(chatId).catch(() => []),
      this.raw.getChatMemberCount(chatId).catch(() => undefined),
    ]);

    return {
      id: String(chatId),
      subject: chat.title || '',
      desc: chat.description || '',
      creation: undefined, // non exposé par l'API Bot Telegram
      memberCount,
      participants: admins.map((a) => ({
        id: String(a.user.id),
        name: a.user.first_name,
        username: a.user.username,
        admin: a.status === 'creator' ? 'superadmin' : a.status === 'administrator' ? 'admin' : null,
      })),
    };
  }

  async getChatMemberStatus(chatId, userId) {
    try {
      const member = await this.raw.getChatMember(chatId, userId);
      return member.status; // 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked'
    } catch {
      return null;
    }
  }

  async readMessages() {
    // LIMITATION TELEGRAM : les bots n'ont pas accès aux accusés de lecture
    // ("vu"). Ce toggle (/autoread) n'a donc aucun effet visible ici.
  }

  async sendPresenceUpdate(action, chatId) {
    try {
      await this.raw.sendChatAction(chatId, presenceToChatAction(action));
    } catch (err) {
      log.warn("Échec de l'indicateur de présence", err.message);
    }
  }

  // ---------------------------------------------------------------------
  // Gestion des membres.
  // LIMITATION TELEGRAM : un bot ne peut PAS ajouter un utilisateur à un
  // groupe (restriction de confidentialité de la plateforme) — seul un lien
  // d'invitation peut être généré. Voir commands/group/add.js.
  // ---------------------------------------------------------------------
  async groupParticipantsUpdate(chatId, ids, action) {
    for (const id of ids) {
      if (action === 'remove') {
        await this.raw.banChatMember(chatId, id);
        await this.raw.unbanChatMember(chatId, id, { only_if_banned: true });
      } else if (action === 'promote') {
        await this.raw.promoteChatMember(chatId, id, {
          can_change_info: true,
          can_delete_messages: true,
          can_invite_users: true,
          can_restrict_members: true,
          can_pin_messages: true,
          can_manage_video_chats: true,
          can_promote_members: false,
        });
      } else if (action === 'demote') {
        await this.raw.promoteChatMember(chatId, id, {
          can_change_info: false,
          can_delete_messages: false,
          can_invite_users: false,
          can_restrict_members: false,
          can_pin_messages: false,
          can_manage_video_chats: false,
          can_promote_members: false,
        });
      } else if (action === 'add') {
        throw new Error('ADD_NOT_SUPPORTED_BY_TELEGRAM');
      }
    }
  }

  async updateBlockStatus() {
    throw new Error('BLOCK_NOT_SUPPORTED_BY_TELEGRAM');
  }

  async groupInviteCode(chatId) {
    return this.raw.exportChatInviteLink(chatId); // lien complet, pas un simple code
  }

  async groupRevokeInvite(chatId) {
    // exportChatInviteLink révoque automatiquement l'ancien lien primaire et en génère un nouveau
    return this.raw.exportChatInviteLink(chatId);
  }

  async groupUpdateSubject(chatId, title) {
    return this.raw.setChatTitle(chatId, title);
  }

  async groupUpdateDescription(chatId, desc) {
    return this.raw.setChatDescription(chatId, desc);
  }

  async updateProfilePicture(chatId, buffer) {
    return this.raw.setChatPhoto(chatId, buffer);
  }

  async groupSettingUpdate(chatId, setting) {
    const open = setting === 'not_announcement';
    return this.raw.setChatPermissions(chatId, {
      can_send_messages: true, // requis par l'API même si false pour le reste
      can_send_other_messages: open,
      can_send_polls: open,
      can_add_web_page_previews: open,
      can_change_info: false,
      can_invite_users: open,
      can_pin_messages: false,
      ...(open ? {} : { can_send_messages: false }),
    });
  }
}
