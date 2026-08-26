import { formatDuration } from '../../utils/formatter.js';
import { getUptimeMs } from '../../utils/uptime.js';

export default {
  name: 'runtime',
  aliases: ['uptime'],
  category: 'general',
  description: "Affiche la durée depuis laquelle H$Λ BOT est en ligne.",
  async execute(ctx) {
    await ctx.reply(`⏱️ Temps de fonctionnement : ${formatDuration(getUptimeMs())}`);
  },
};
