import { errorMessage, successMessage } from '../../utils/formatter.js';

export default {
  name: 'revoke',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: "Révoque et régénère le lien d'invitation du groupe.",
  async execute(ctx) {
    try {
      await ctx.bot.groupRevokeInvite(ctx.chatId);
      await ctx.reply(successMessage("Lien d'invitation révoqué et régénéré."));
    } catch {
      await ctx.reply(errorMessage('Échec de la révocation du lien.'));
    }
  },
};
