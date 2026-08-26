import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'maintenance',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: 'Active/désactive le mode maintenance. Usage : /maintenance on|off',
  async execute(ctx) {
    const mode = (ctx.args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      const current = db.getSetting('maintenance', false);
      await ctx.reply(`ℹ️ Mode maintenance : ${current ? 'activé ✅' : 'désactivé ❌'}\n\nUtilisation : ${ctx.prefix}maintenance on|off`);
      return;
    }
    db.setSetting('maintenance', mode === 'on');
    await ctx.reply(successMessage(`Mode maintenance ${mode === 'on' ? 'activé 🛠️' : 'désactivé ✅'}.`));
  },
};
