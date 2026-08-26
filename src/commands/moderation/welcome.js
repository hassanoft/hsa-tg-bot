import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'welcome',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: "Message de bienvenue automatique. Usage : /welcome on|off|set <message avec @user>",
  async execute(ctx) {
    const [mode, ...rest] = ctx.args;

    if (mode === 'set') {
      db.updateGroupSettings(ctx.chatId, { welcomeMessage: rest.join(' ') });
      await ctx.reply(successMessage('Message de bienvenue mis à jour.'));
      return;
    }

    if (!['on', 'off'].includes(mode)) {
      const current = db.getGroupSettings(ctx.chatId).welcome;
      await ctx.reply(`ℹ️ Bienvenue automatique : ${current ? 'activée ✅' : 'désactivée ❌'}\n\nUtilisation : ${ctx.prefix}welcome on|off|set <message>`);
      return;
    }

    db.updateGroupSettings(ctx.chatId, { welcome: mode === 'on' });
    await ctx.reply(successMessage(`Message de bienvenue ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
