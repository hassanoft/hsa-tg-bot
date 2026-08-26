import { db } from '../../database/database.js';
import { successMessage, errorMessage } from '../../utils/formatter.js';

export default {
  name: 'antilink',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: 'Supprime automatiquement les liens non autorisés. Usage : /antilink on|off|whitelist <lien>',
  async execute(ctx) {
    const [mode, ...rest] = ctx.args;

    if (mode === 'whitelist' && rest.length) {
      const settings = db.getGroupSettings(ctx.chatId);
      const list = new Set(settings.antilinkWhitelist || []);
      list.add(rest.join(' '));
      db.updateGroupSettings(ctx.chatId, { antilinkWhitelist: [...list] });
      await ctx.reply(successMessage('Lien ajouté à la liste blanche.'));
      return;
    }

    if (!['on', 'off'].includes(mode)) {
      const current = db.getGroupSettings(ctx.chatId).antilink;
      await ctx.reply(
        `ℹ️ Antilink est actuellement : ${current ? 'activé ✅' : 'désactivé ❌'}\n\n` +
        `Utilisation : ${ctx.prefix}antilink on|off\n${ctx.prefix}antilink whitelist <lien>`
      );
      return;
    }

    db.updateGroupSettings(ctx.chatId, { antilink: mode === 'on' });
    await ctx.reply(successMessage(`Antilink ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
