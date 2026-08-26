import { getTargetIds } from './_groupHelpers.js';
import { errorMessage, successMessage } from '../../utils/formatter.js';

export default {
  name: 'demote',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: "Retire les droits d'administrateur d'un membre.",
  async execute(ctx) {
    const targets = getTargetIds(ctx);
    if (!targets.length) {
      await ctx.reply('❌ Mentionnez ou répondez au membre à rétrograder.');
      return;
    }
    try {
      await ctx.bot.groupParticipantsUpdate(ctx.chatId, targets, 'demote');
      await ctx.reply(successMessage('Droits administrateur retirés.'));
    } catch {
      await ctx.reply(errorMessage('Échec de la rétrogradation.'));
    }
  },
};
