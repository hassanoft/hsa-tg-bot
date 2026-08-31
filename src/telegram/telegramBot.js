// Adaptateur Telegram.
//
// Objectif : exposer une interface proche de celle qu'utilisaient les
// commandes H$Λ BOT (héritée de la version WhatsApp/Baileys), pour que la
// quasi-totalité des commandes fonctionnent SANS modification.
//
// Ce fichier est le SEUL endroit qui parle directement à
// node-telegram-bot-api.

import TelegramBot from 'node-telegram-bot-api';

import { logger } from '../utils/logger.js';
import { config } from '../config.js';

const log = logger.child({
  class: 'telegramBot',
});

function resolveMediaInput(value) {
  if (Buffer.isBuffer(value)) {
    return value;
  }

  if (
    value &&
    typeof value === 'object' &&
    value.url
  ) {
    return value.url;
  }

  return value;
}

function presenceToChatAction(action) {
  if (action === 'composing') {
    return 'typing';
  }

  if (action === 'recording') {
    return 'record_voice';
  }

  return 'typing';
}

const JOINED_STATUSES = new Set([
  'creator',
  'administrator',
  'member',
]);

export class TelegramAdapter {
  constructor(token) {
    this.raw = new TelegramBot(token, {
      polling: true,
    });

    this.user = null;

    // ---------------------------------------------------
    // CALLBACK QUERY
    // ---------------------------------------------------

    this.raw.on(
      'callback_query',
      async (query) => {
        try {
          await this.handleCallbackQuery(query);
        } catch (err) {
          log.error(
            'Erreur callback_query',
            err.message,
            err.stack
          );
        }
      }
    );
  }

  // -----------------------------------------------------
  // CALLBACKS TELEGRAM
  // -----------------------------------------------------

  async handleCallbackQuery(query) {
    if (!query?.data) {
      return;
    }

    // ---------------------------------------------------
    // FORCE JOIN : bouton "Vérifier"
    // ---------------------------------------------------

    if (query.data === 'forcejoin_check') {
      await this.handleForceJoinCheck(query);
      return;
    }

    // Si d'autres callbacks existent dans ton bot,
    // ils peuvent être ajoutés ici.
  }

  async handleForceJoinCheck(query) {
    const userId = String(query.from.id);

    const chatId = query.message
      ? String(query.message.chat.id)
      : null;

    if (!chatId) {
      await this.raw.answerCallbackQuery(
        query.id,
        {
          text: '⚠️ Impossible de déterminer le chat.',
          show_alert: true,
        }
      );

      return;
    }

    if (!config.forceJoin?.enabled) {
      await this.raw.answerCallbackQuery(
        query.id,
        {
          text: '✅ Le contrôle est désactivé.',
        }
      );

      return;
    }

    try {
      const status =
        await this.getChatMemberStatus(
          config.forceJoin.channel,
          userId
        );

      const joined =
        JOINED_STATUSES.has(status);

      // -------------------------------------------------
      // PAS ABONNÉ
      // -------------------------------------------------

      if (!joined) {
        await this.raw.answerCallbackQuery(
          query.id,
          {
            text:
              '❌ Tu n’es pas encore membre du canal.',
            show_alert: true,
          }
        );

        return;
      }

      // -------------------------------------------------
      // ABONNÉ
      // -------------------------------------------------

      await this.raw.answerCallbackQuery(
        query.id,
        {
          text:
            '✅ Abonnement confirmé !',
        }
      );

      await this.raw.editMessageText(
        `✅ Abonnement confirmé !\n\n` +
        `👋 Bienvenue ${query.from.first_name || ''} !\n\n` +
        `Tu peux maintenant utiliser H$Λ BOT.\n\n` +
        `Utilise ${config.prefix}help pour afficher les commandes.`,
        {
          chat_id: chatId,
          message_id:
            query.message.message_id,
        }
      );
    } catch (err) {
      log.error(
        'Erreur vérification Force Join',
        err.message,
        err.stack
      );

      await this.raw.answerCallbackQuery(
        query.id,
        {
          text:
            '⚠️ Impossible de vérifier ton abonnement.',
          show_alert: true,
        }
      );
    }
  }

  // -----------------------------------------------------
  // ENVOI DE MESSAGE
  // -----------------------------------------------------

  async sendMessage(
    chatId,
    content,
    opts = {}
  ) {
    const options = {};

    if (opts.quoted?.message_id) {
      options.reply_to_message_id =
        opts.quoted.message_id;
    }

    if (content.parse_mode) {
      options.parse_mode =
        content.parse_mode;
    }

    // IMPORTANT :
    // Permet aux boutons inline d'être envoyés.
    if (content.reply_markup) {
      options.reply_markup =
        content.reply_markup;
    }

    // ---------------------------------------------------
    // SUPPRESSION
    // ---------------------------------------------------

    if (content.delete) {
      await this.raw.deleteMessage(
        chatId,
        content.delete.id
      );

      return {
        key: {
          id: content.delete.id,
          remoteJid: String(chatId),
        },
      };
    }

    // ---------------------------------------------------
    // ÉDITION
    // ---------------------------------------------------

    if (content.edit) {
      const msg =
        await this.raw.editMessageText(
          content.text,
          {
            chat_id: chatId,
            message_id:
              content.edit.id,
            ...options,
          }
        );

      const id =
        typeof msg === 'object'
          ? msg.message_id
          : content.edit.id;

      return {
        key: {
          id,
          remoteJid: String(chatId),
        },
      };
    }

    // ---------------------------------------------------
    // CONTACT
    // ---------------------------------------------------

    if (content.contacts) {
      const c =
        content.contacts.contacts?.[0];

      const phoneMatch =
        c?.vcard?.match(
          /waid=(\d+)/
        );

      const text = phoneMatch
        ? `👑 Contact : +${phoneMatch[1]}`
        : (
            content.contacts
              .displayName ||
            'Contact'
          );

      const msg =
        await this.raw.sendMessage(
          chatId,
          text,
          options
        );

      return {
        key: {
          id: msg.message_id,
          remoteJid: String(chatId),
        },
      };
    }

    // ---------------------------------------------------
    // IMAGE
    // ---------------------------------------------------

    let msg;

    if (
      content.image !== undefined
    ) {
      msg =
        await this.raw.sendPhoto(
          chatId,
          resolveMediaInput(
            content.image
          ),
          {
            ...options,
            caption:
              content.caption,
          }
        );
    }

    // ---------------------------------------------------
    // STICKER
    // ---------------------------------------------------

    else if (
      content.sticker !== undefined
    ) {
      msg =
        await this.raw.sendSticker(
          chatId,
          resolveMediaInput(
            content.sticker
          ),
          options
        );
    }

    // ---------------------------------------------------
    // VIDEO
    // ---------------------------------------------------

    else if (
      content.video !== undefined
    ) {
      if (content.gifPlayback) {
        msg =
          await this.raw.sendAnimation(
            chatId,
            resolveMediaInput(
              content.video
            ),
            {
              ...options,
              caption:
                content.caption,
            }
          );
      } else {
        msg =
          await this.raw.sendVideo(
            chatId,
            resolveMediaInput(
              content.video
            ),
            {
              ...options,
              caption:
                content.caption,
            },
            content.mimetype
              ? {
                  contentType:
                    content.mimetype,
                }
              : {}
          );
      }
    }

    // ---------------------------------------------------
    // AUDIO
    // ---------------------------------------------------

    else if (
      content.audio !== undefined
    ) {
      if (content.ptt) {
        msg =
          await this.raw.sendVoice(
            chatId,
            resolveMediaInput(
              content.audio
            ),
            options
          );
      } else {
        msg =
          await this.raw.sendAudio(
            chatId,
            resolveMediaInput(
              content.audio
            ),
            options,
            content.mimetype
              ? {
                  contentType:
                    content.mimetype,
                }
              : {}
          );
      }
    }

    // ---------------------------------------------------
    // DOCUMENT
    // ---------------------------------------------------

    else if (
      content.document !== undefined
    ) {
      msg =
        await this.raw.sendDocument(
          chatId,
          resolveMediaInput(
            content.document
          ),
          {
            ...options,
            caption:
              content.caption,
          },
          {
            filename:
              content.fileName ||
              'fichier',
            contentType:
              content.mimetype ||
              'application/octet-stream',
          }
        );
    }

    // ---------------------------------------------------
    // TEXTE
    // ---------------------------------------------------

    else if (
      content.text !== undefined
    ) {
      msg =
        await this.raw.sendMessage(
          chatId,
          content.text,
          options
        );
    }

    // ---------------------------------------------------
    // INCONNU
    // ---------------------------------------------------

    else {
      throw new Error(
        'Contenu de message non pris en charge par TelegramAdapter.'
      );
    }

    return {
      key: {
        id: msg.message_id,
        remoteJid: String(chatId),
      },
    };
  }

  // -----------------------------------------------------
  // MÉTADONNÉES GROUPE
  // -----------------------------------------------------

  async groupMetadata(chatId) {
    const [
      chat,
      admins,
      memberCount,
    ] = await Promise.all([
      this.raw.getChat(chatId),

      this.raw
        .getChatAdministrators(chatId)
        .catch(() => []),

      this.raw
        .getChatMemberCount(chatId)
        .catch(() => undefined),
    ]);

    return {
      id: String(chatId),
      subject: chat.title || '',
      desc: chat.description || '',
      creation: undefined,
      memberCount,

      participants:
        admins.map((a) => ({
          id: String(a.user.id),
          name: a.user.first_name,
          username:
            a.user.username,

          admin:
            a.status === 'creator'
              ? 'superadmin'
              : a.status ===
                'administrator'
              ? 'admin'
              : null,
        })),
    };
  }

  // -----------------------------------------------------
  // STATUT MEMBRE
  // -----------------------------------------------------

  async getChatMemberStatus(
    chatId,
    userId
  ) {
    try {
      const member =
        await this.raw.getChatMember(
          chatId,
          userId
        );

      return member.status;
    } catch (err) {
      log.warn(
        `Impossible de vérifier le membre ${userId} dans ${chatId}`,
        err.message
      );

      return null;
    }
  }

  // -----------------------------------------------------
  // READ
  // -----------------------------------------------------

  async readMessages() {
    // Telegram ne fournit pas de système de
    // confirmation de lecture pour les bots.
  }

  // -----------------------------------------------------
  // PRÉSENCE
  // -----------------------------------------------------

  async sendPresenceUpdate(
    action,
    chatId
  ) {
    try {
      await this.raw.sendChatAction(
        chatId,
        presenceToChatAction(action)
      );
    } catch (err) {
      log.warn(
        "Échec de l'indicateur de présence",
        err.message
      );
    }
  }

  // -----------------------------------------------------
  // GESTION DES MEMBRES
  // -----------------------------------------------------

  async groupParticipantsUpdate(
    chatId,
    ids,
    action
  ) {
    for (const id of ids) {
      if (action === 'remove') {
        await this.raw.banChatMember(
          chatId,
          id
        );

        await this.raw.unbanChatMember(
          chatId,
          id,
          {
            only_if_banned: true,
          }
        );
      }

      else if (action === 'promote') {
        await this.raw.promoteChatMember(
          chatId,
          id,
          {
            can_change_info: true,
            can_delete_messages: true,
            can_invite_users: true,
            can_restrict_members: true,
            can_pin_messages: true,
            can_manage_video_chats: true,
            can_promote_members: false,
          }
        );
      }

      else if (action === 'demote') {
        await this.raw.promoteChatMember(
          chatId,
          id,
          {
            can_change_info: false,
            can_delete_messages: false,
            can_invite_users: false,
            can_restrict_members: false,
            can_pin_messages: false,
            can_manage_video_chats: false,
            can_promote_members: false,
          }
        );
      }

      else if (action === 'add') {
        throw new Error(
          'ADD_NOT_SUPPORTED_BY_TELEGRAM'
        );
      }
    }
  }

  async updateBlockStatus() {
    throw new Error(
      'BLOCK_NOT_SUPPORTED_BY_TELEGRAM'
    );
  }

  async groupInviteCode(chatId) {
    return this.raw.exportChatInviteLink(
      chatId
    );
  }

  async groupRevokeInvite(chatId) {
    return this.raw.exportChatInviteLink(
      chatId
    );
  }

  async groupUpdateSubject(
    chatId,
    title
  ) {
    return this.raw.setChatTitle(
      chatId,
      title
    );
  }

  async groupUpdateDescription(
    chatId,
    desc
  ) {
    return this.raw.setChatDescription(
      chatId,
      desc
    );
  }

  async updateProfilePicture(
    chatId,
    buffer
  ) {
    return this.raw.setChatPhoto(
      chatId,
      buffer
    );
  }

  async groupSettingUpdate(
    chatId,
    setting
  ) {
    const open =
      setting === 'not_announcement';

    return this.raw.setChatPermissions(
      chatId,
      {
        can_send_messages: true,
        can_send_other_messages: open,
        can_send_polls: open,
        can_add_web_page_previews: open,
        can_change_info: false,
        can_invite_users: open,
        can_pin_messages: false,

        ...(open
          ? {}
          : {
              can_send_messages: false,
            }),
      }
    );
  }
}