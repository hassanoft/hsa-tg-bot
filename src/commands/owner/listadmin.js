import { db } from '../../database/database.js';
import { formatMention } from '../../utils/helpers.js';

export default {
  name: 'listadmin',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: 'Liste les administrateurs applicatifs de H$Λ BOT.',
  async execute(ctx) {
    const admins = db.listBotAdmins();
    if (!admins.length) {
      await ctx.reply('ℹ️ Aucun administrateur applicatif défini (en dehors du propriétaire).');
      return;
    }
    const lines = admins.map((a) => {
      const known = db.users.get(a);
      return `• ${formatMention(a, known?.name || a)}`;
    });
    await ctx.bot.sendMessage(ctx.chatId, {
      text: `👮 Administrateurs H$Λ BOT :\n${lines.join('\n')}`,
      parse_mode: 'HTML',
    });
  },
};
