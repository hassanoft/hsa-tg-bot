import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'autorecording',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: "Indicateur \"enregistrement audio\" automatique. Usage : /autorecording on|off",
  async execute(ctx) {
    const mode = (ctx.args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      const current = db.getGroupSettings(ctx.chatId).autorecording;
      await ctx.reply(`ℹ️ Indicateur "enregistrement audio" automatique est actuellement : ${current ? 'activé ✅' : 'désactivé ❌'}\n\nUtilisation : ${ctx.prefix}autorecording on|off`);
      return;
    }
    db.updateGroupSettings(ctx.chatId, { autorecording: mode === 'on' });
    await ctx.reply(successMessage(`Indicateur "enregistrement audio" automatique ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
