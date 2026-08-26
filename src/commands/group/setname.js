import { errorMessage, successMessage } from '../../utils/formatter.js';

export default {
  name: 'setname',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: 'Modifie le nom du groupe. Usage : /setname <nouveau nom>',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}setname <nouveau nom>`);
      return;
    }
    try {
      await ctx.bot.groupUpdateSubject(ctx.chatId, ctx.text);
      await ctx.reply(successMessage('Nom du groupe mis à jour.'));
    } catch {
      await ctx.reply(errorMessage('Échec de la mise à jour du nom.'));
    }
  },
};
