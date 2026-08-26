import { errorMessage, successMessage } from '../../utils/formatter.js';

export default {
  name: 'close',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: 'Seuls les administrateurs peuvent écrire dans le groupe.',
  async execute(ctx) {
    try {
      await ctx.bot.groupSettingUpdate(ctx.chatId, 'announcement');
      await ctx.reply(successMessage('Groupe fermé : seuls les administrateurs peuvent écrire.'));
    } catch {
      await ctx.reply(errorMessage('Échec de la fermeture du groupe.'));
    }
  },
};
