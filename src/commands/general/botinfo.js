import os from 'node:os';
import { config } from '../../config.js';
import { formatDuration, formatBytes } from '../../utils/formatter.js';
import { getUptimeMs } from '../../utils/uptime.js';
import { getAllCommands } from '../../handlers/commandHandler.js';

export default {
  name: 'botinfo',
  aliases: ['info'],
  category: 'general',
  description: 'Informations techniques sur le bot.',
  async execute(ctx) {
    const mem = process.memoryUsage();
    await ctx.reply(
      `👑 ${config.botName}\n` +
      `📄 Description : Multifunction Telegram Bot\n\n` +
      `🔧 Préfixe : ${ctx.prefix}\n` +
      `📦 Commandes chargées : ${getAllCommands().length}\n` +
      `⏱️ En ligne depuis : ${formatDuration(getUptimeMs())}\n` +
      `💾 Mémoire utilisée : ${formatBytes(mem.rss)}\n` +
      `🖥️ Node.js : ${process.version}\n` +
      `🖥️ Plateforme : ${os.platform()} (${os.arch()})\n` +
      `💯 % Gratuit — aucune fonctionnalité payante.`
    );
  },
};
