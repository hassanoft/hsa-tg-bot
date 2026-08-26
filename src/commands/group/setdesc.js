import { errorMessage, successMessage } from '../../utils/formatter.js';

export default {
  name: 'setdesc',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: 'Modifie la description du groupe. Usage : /setdesc <texte>',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}setdesc <nouvelle description>`);
      return;
    }
    try {
      await ctx.bot.groupUpdateDescription(ctx.chatId, ctx.text);
      await ctx.reply(successMessage('Description du groupe mise à jour.'));
    } catch {
      await ctx.reply(errorMessage('Échec de la mise à jour de la description.'));
    }
  },
};
