import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'antiflood',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: 'Anti-flood. Usage : /antiflood on|off',
  async execute(ctx) {
    const mode = (ctx.args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      const current = db.getGroupSettings(ctx.chatId).antiflood;
      await ctx.reply(`ℹ️ Anti-flood est actuellement : ${current ? 'activé ✅' : 'désactivé ❌'}\n\nUtilisation : ${ctx.prefix}antiflood on|off`);
      return;
    }
    db.updateGroupSettings(ctx.chatId, { antiflood: mode === 'on' });
    await ctx.reply(successMessage(`Anti-flood ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
