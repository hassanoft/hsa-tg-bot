import { config } from '../../config.js';
import { formatDuration } from '../../utils/formatter.js';
import { getUptimeMs } from '../../utils/uptime.js';

export default {
  name: 'alive',
  aliases: [],
  category: 'general',
  description: 'Confirme que le bot est actif et opérationnel.',
  async execute(ctx) {
    await ctx.reply(
      `✅ ${config.botName} est actif et opérationnel.\n` +
      `⏱️ En ligne depuis : ${formatDuration(getUptimeMs())}\n` +
      `🔧 Préfixe actuel : ${ctx.prefix}`
    );
  },
};
