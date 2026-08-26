import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'antibadword',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: 'Anti-injures. Usage : /antibadword on|off|add <mot>|list',
  async execute(ctx) {
    const [mode, ...rest] = ctx.args;
    const settings = db.getGroupSettings(ctx.chatId);

    if (mode === 'add' && rest.length) {
      const list = new Set(settings.antibadwordList || []);
      list.add(rest.join(' ').toLowerCase());
      db.updateGroupSettings(ctx.chatId, { antibadwordList: [...list] });
      await ctx.reply(successMessage('Mot ajouté à la liste des mots interdits.'));
      return;
    }

    if (mode === 'list') {
      const list = settings.antibadwordList || [];
      await ctx.reply(list.length ? `📋 Mots interdits :\n${list.join(', ')}` : 'ℹ️ Aucun mot interdit configuré.');
      return;
    }

    if (!['on', 'off'].includes(mode)) {
      await ctx.reply(
        `ℹ️ Antibadword est actuellement : ${settings.antibadword ? 'activé ✅' : 'désactivé ❌'}\n\n` +
        `Utilisation :\n${ctx.prefix}antibadword on|off\n${ctx.prefix}antibadword add <mot>\n${ctx.prefix}antibadword list`
      );
      return;
    }

    db.updateGroupSettings(ctx.chatId, { antibadword: mode === 'on' });
    await ctx.reply(successMessage(`Antibadword ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
