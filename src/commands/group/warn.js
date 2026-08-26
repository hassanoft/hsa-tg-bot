import { getTargetIds } from './_groupHelpers.js';
import { db } from '../../database/database.js';
import { formatMention } from '../../utils/helpers.js';

export default {
  name: 'warn',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  description: 'Ajoute un avertissement à un membre.',
  async execute(ctx) {
    const targets = getTargetIds(ctx);
    if (!targets.length) {
      await ctx.reply('❌ Mentionnez ou répondez au membre à avertir.');
      return;
    }
    const settings = db.getGroupSettings(ctx.chatId);
    const target = targets[0];
    const targetName = ctx.msg.reply_to_message?.from?.first_name || target;
    const warnings = db.addWarning(ctx.chatId, target, ctx.args.slice(1).join(' ') || 'Non spécifiée');
    await ctx.bot.sendMessage(ctx.chatId, {
      text: `⚠️ Warning pour ${formatMention(target, targetName)} : ${warnings.length}/${settings.warnLimit || 3}`,
      parse_mode: 'HTML',
    });
  },
};
