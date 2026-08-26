import { getTargetIds } from '../group/_groupHelpers.js';
import { db } from '../../database/database.js';
import { successMessage } from '../../utils/formatter.js';

export default {
  name: 'addadmin',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: 'Ajoute un administrateur applicatif de H$Λ BOT.',
  async execute(ctx) {
    const targets = getTargetIds(ctx);
    if (!targets.length) {
      await ctx.reply('❌ Mentionnez (répondez à son message) ou indiquez l\'identifiant Telegram à ajouter comme admin.');
      return;
    }
    db.addBotAdmin(targets[0]);
    await ctx.reply(successMessage(`L'utilisateur ${targets[0]} est maintenant administrateur de H$Λ BOT.`));
  },
};
