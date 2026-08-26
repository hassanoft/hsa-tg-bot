import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'goodbye',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: "Message d'au revoir automatique. Usage : /goodbye on|off|set <message avec @user>",
  async execute(ctx) {
    const [mode, ...rest] = ctx.args;

    if (mode === 'set') {
      db.updateGroupSettings(ctx.chatId, { goodbyeMessage: rest.join(' ') });
      await ctx.reply(successMessage("Message d'au revoir mis à jour."));
      return;
    }

    if (!['on', 'off'].includes(mode)) {
      const current = db.getGroupSettings(ctx.chatId).goodbye;
      await ctx.reply(`ℹ️ Message d'au revoir : ${current ? 'activé ✅' : 'désactivé ❌'}\n\nUtilisation : ${ctx.prefix}goodbye on|off|set <message>`);
      return;
    }

    db.updateGroupSettings(ctx.chatId, { goodbye: mode === 'on' });
    await ctx.reply(successMessage(`Message d'au revoir ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
