import { config } from '../../config.js';
import { db } from '../../database/database.js';
import { successMessage, errorMessage } from '../../utils/formatter.js';

export default {
  name: 'antinsfw',
  aliases: [],
  category: 'moderation',
  groupOnly: true,
  adminOnly: true,
  description: 'Détecte et supprime automatiquement les images NSFW (nécessite NSFW_API_URL). Usage : /antinsfw on|off',
  async execute(ctx) {
    const mode = (ctx.args[0] || '').toLowerCase();
    if (!['on', 'off'].includes(mode)) {
      const current = db.getGroupSettings(ctx.chatId).antinsfw;
      await ctx.reply(`ℹ️ Antinsfw est actuellement : ${current ? 'activé ✅' : 'désactivé ❌'}\n\nUtilisation : ${ctx.prefix}antinsfw on|off`);
      return;
    }
    if (mode === 'on' && !config.nsfw.apiUrl) {
      await ctx.reply(errorMessage('Cette fonctionnalité nécessite NSFW_API_URL dans .env.'));
      return;
    }
    db.updateGroupSettings(ctx.chatId, { antinsfw: mode === 'on' });
    await ctx.reply(successMessage(`Antinsfw ${mode === 'on' ? 'activé ✅' : 'désactivé ❌'}.`));
  },
};
