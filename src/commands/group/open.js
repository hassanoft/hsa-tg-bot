import { errorMessage, successMessage } from '../../utils/formatter.js';

export default {
  name: 'open',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: 'Autorise tous les membres à écrire dans le groupe.',
  async execute(ctx) {
    try {
      await ctx.bot.groupSettingUpdate(ctx.chatId, 'not_announcement');
      await ctx.reply(successMessage('Groupe ouvert : tous les membres peuvent écrire.'));
    } catch {
      await ctx.reply(errorMessage("Échec de l'ouverture du groupe."));
    }
  },
};
