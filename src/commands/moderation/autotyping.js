import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'autotyping',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: "Indicateur \"en train d'écrire\" automatique. Usage : /autotyping on|off",
  async execute(ctx) {
    const mode = (ctx.args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      const current = db.getGroupSettings(ctx.chatId).autotyping;
      await ctx.reply(`ℹ️ Indicateur "en train d'écrire" automatique est actuellement : ${current ? 'activé ✅' : 'désactivé ❌'}\n\nUtilisation : ${ctx.prefix}autotyping on|off`);
      return;
    }
    db.updateGroupSettings(ctx.chatId, { autotyping: mode === 'on' });
    await ctx.reply(successMessage(`Indicateur "en train d'écrire" automatique ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
