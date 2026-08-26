import { config } from '../config.js';
import { logger } from '../utils/logger.js';
import { TelegramAdapter } from '../telegram/telegramBot.js';
import { setTelegramBot } from '../utils/media.js';
import { handleIncomingMessage } from './messageHandler.js';

const log = logger.child({ class: 'connection' });

export async function startConnection() {
  if (!config.botToken) {
    log.fatal(
      "BOT_TOKEN n'est pas défini. Créez un bot via @BotFather sur Telegram, " +
        'puis renseignez le jeton obtenu dans la variable BOT_TOKEN (.env).'
    );
    throw new Error('BOT_TOKEN manquant.');
  }

  const bot = new TelegramAdapter(config.botToken);
  setTelegramBot(bot);

  const me = await bot.raw.getMe();
  bot.user = { id: String(me.id), name: me.first_name, username: me.username };
  log.info(`✅ ${config.botName} connecté à Telegram en tant que @${me.username} (id: ${me.id}).`);

  bot.raw.on('message', (msg) => {
    handleIncomingMessage(bot, msg).catch((err) => {
      log.error('Erreur non gérée dans le traitement du message', err.message, err.stack);
    });
  });

  bot.raw.on('polling_error', (err) => {
    log.error('Erreur de polling Telegram', err.message);
  });

  bot.raw.on('webhook_error', (err) => {
    log.error('Erreur de webhook Telegram', err.message);
  });

  return bot;
}
