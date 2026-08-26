import { getTargetIds } from './_groupHelpers.js';
import { errorMessage, successMessage } from '../../utils/formatter.js';

export default {
  name: 'kick',
  aliases: ['remove'],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: "Exclut un membre du groupe (mentionnez-le ou répondez à son message).",
  async execute(ctx) {
    const targets = getTargetIds(ctx);
    if (!targets.length) {
      await ctx.reply('❌ Mentionnez ou répondez au membre à exclure.');
      return;
    }
    try {
      await ctx.bot.groupParticipantsUpdate(ctx.chatId, targets, 'remove');
      await ctx.reply(successMessage('Membre(s) exclu(s) du groupe.'));
    } catch {
      await ctx.reply(errorMessage("Échec de l'exclusion (vérifiez les droits admin du bot)."));
    }
  },
};
