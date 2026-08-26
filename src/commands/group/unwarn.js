import { getTargetIds } from './_groupHelpers.js';
import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'unwarn',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  description: 'Retire un avertissement à un membre.',
  async execute(ctx) {
    const targets = getTargetIds(ctx);
    if (!targets.length) {
      await ctx.reply('❌ Mentionnez ou répondez au membre concerné.');
      return;
    }
    const warnings = db.removeWarning(ctx.chatId, targets[0]);
    await ctx.reply(successMessage(`Avertissement retiré. Total actuel : ${warnings.length}`));
  },
};
