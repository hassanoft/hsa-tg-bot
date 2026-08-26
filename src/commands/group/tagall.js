import { formatMention } from '../../utils/helpers.js';

// LIMITATION TELEGRAM : l'API Bot ne permet pas de lister tous les membres
// d'un groupe. Cette commande mentionne donc les membres que H$Λ BOT a
// déjà vus écrire dans ce groupe (registre "best effort"), pas la totalité
// théorique des membres.
export default {
  name: 'tagall',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  description: 'Mentionne les membres du groupe déjà vus par le bot (limitation Telegram : liste complète non accessible).',
  async execute(ctx) {
    const members = ctx.db.getGroupMembers(ctx.chatId);
    if (!members.length) {
      await ctx.reply('❌ Aucun membre connu pour le moment (le bot doit avoir déjà vu des messages dans ce groupe).');
      return;
    }
    const mentionsText = members.map((m) => formatMention(m.id, m.name)).join(' ');
    await ctx.bot.sendMessage(ctx.chatId, {
      text: `📢 ${ctx.text || 'Attention à tous !'}\n\n${mentionsText}`,
      parse_mode: 'HTML',
    });
  },
};
