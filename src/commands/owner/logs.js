import { readRecentLogs } from '../../utils/logger.js';

export default {
  name: 'logs',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: 'Affiche les dernières lignes de logs du bot.',
  async execute(ctx) {
    const lines = readRecentLogs(30);
    if (!lines.length) {
      await ctx.reply('ℹ️ Aucun log disponible pour le moment.');
      return;
    }
    await ctx.reply(`📜 Derniers logs :\n\`\`\`${lines.join('\n').slice(-3500)}\`\`\``);
  },
};
