import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'antispam',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: 'Anti-spam (messages répétés). Usage : /antispam on|off',
  async execute(ctx) {
    const mode = (ctx.args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      const current = db.getGroupSettings(ctx.chatId).antispam;
      await ctx.reply(`ℹ️ Anti-spam (messages répétés) est actuellement : ${current ? 'activé ✅' : 'désactivé ❌'}\n\nUtilisation : ${ctx.prefix}antispam on|off`);
      return;
    }
    db.updateGroupSettings(ctx.chatId, { antispam: mode === 'on' });
    await ctx.reply(successMessage(`Anti-spam (messages répétés) ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
