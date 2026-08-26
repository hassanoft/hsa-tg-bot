import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'autoread',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: 'Lecture automatique des messages. Usage : /autoread on|off',
  async execute(ctx) {
    const mode = (ctx.args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      const current = db.getGroupSettings(ctx.chatId).autoread;
      await ctx.reply(`ℹ️ Lecture automatique des messages est actuellement : ${current ? 'activé ✅' : 'désactivé ❌'}\n\nUtilisation : ${ctx.prefix}autoread on|off`);
      return;
    }
    db.updateGroupSettings(ctx.chatId, { autoread: mode === 'on' });
    await ctx.reply(successMessage(`Lecture automatique des messages ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
