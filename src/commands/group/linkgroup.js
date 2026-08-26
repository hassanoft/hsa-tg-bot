import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'linkgroup',
  aliases: ['grouplink'],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: "Affiche le lien d'invitation du groupe.",
  async execute(ctx) {
    try {
      const link = await ctx.bot.groupInviteCode(ctx.chatId);
      await ctx.reply(`🔗 ${link}`);
    } catch {
      await ctx.reply(errorMessage('Impossible de récupérer le lien (le bot doit être admin).'));
    }
  },
};
