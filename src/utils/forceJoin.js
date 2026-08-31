import { config } from '../config.js';

const JOINED_STATUSES = new Set([
  'creator',
  'administrator',
  'member',
]);

export async function checkForceJoin(bot, userId) {
  if (!config.forceJoin?.enabled) {
    return {
      required: false,
      joined: true,
      status: 'disabled',
    };
  }

  try {
    const status = await bot.getChatMemberStatus(
      config.forceJoin.channel,
      String(userId)
    );

    return {
      required: true,
      joined: JOINED_STATUSES.has(status),
      status,
    };
  } catch (err) {
    return {
      required: true,
      joined: false,
      status: null,
      error: err,
    };
  }
}

export function forceJoinMessage() {
  return {
    text:
      '🔒 Accès restreint\n\n' +
      'Pour utiliser H$Λ BOT, tu dois d’abord rejoindre notre canal.\n\n' +
      'Après avoir rejoint le canal, appuie sur « ✅ Vérifier ».',

    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '📢 Rejoindre',
            url: config.forceJoin.channelLink,
          },
        ],
        [
          {
            text: '✅ Vérifier',
            callback_data: 'forcejoin_check',
          },
        ],
      ],
    },
  };
}