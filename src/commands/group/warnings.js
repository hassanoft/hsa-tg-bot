import { getTargetIds } from './_groupHelpers.js';
import { db } from '../../database/database.js';
import { formatMention } from '../../utils/helpers.js';

export default {
  name: 'warnings',
  aliases: [],
  category: 'group',
  groupOnly: true,
  description: "Affiche les avertissements d'un membre.",
  async execute(ctx) {
    const targets = getTargetIds(ctx);
    const target = targets[0] || ctx.senderId;
    const targetName = ctx.msg.reply_to_message?.from?.first_name || ctx.pushName;
    const list = db.getWarnings(ctx.chatId, target);
    if (!list.length) {
      await ctx.reply('✅ Aucun avertissement pour ce membre.');
      return;
    }
    const lines = list.map((w, i) => `${i + 1}. ${w.reason} — ${new Date(w.date).toLocaleDateString('fr-FR')}`);
    await ctx.bot.sendMessage(ctx.chatId, {
      text: `⚠️ Avertissements de ${formatMention(target, targetName)} :\n${lines.join('\n')}`,
      parse_mode: 'HTML',
    });
  },
};
