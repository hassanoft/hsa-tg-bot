import { config } from '../../config.js';
import { formatMention } from '../../utils/helpers.js';

export default {
  name: 'owner',
  aliases: [],
  category: 'general',
  description: 'Affiche le contact du propriétaire du bot.',
  async execute(ctx) {
    if (!config.ownerId) {
      await ctx.reply('❌ Aucun propriétaire configuré pour le moment.');
      return;
    }
    await ctx.bot.sendMessage(ctx.chatId, {
      text: `👑 Propriétaire de H$Λ BOT : ${formatMention(config.ownerId, 'Contacter le propriétaire')}`,
      parse_mode: 'HTML',
    });
  },
};
