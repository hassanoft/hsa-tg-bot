import { formatMention } from '../../utils/helpers.js';

export default {
  name: 'tagadmins',
  aliases: [],
  category: 'group',
  groupOnly: true,
  description: 'Mentionne les administrateurs du groupe.',
  async execute(ctx) {
    const admins = ctx.groupMetadata?.participants || [];
    if (!admins.length) {
      await ctx.reply('❌ Aucun administrateur trouvé.');
      return;
    }
    const mentionsText = admins.map((a) => formatMention(a.id, a.name)).join(' ');
    await ctx.bot.sendMessage(ctx.chatId, {
      text: `👮 ${ctx.text || 'Attention administrateurs :'}\n\n${mentionsText}`,
      parse_mode: 'HTML',
    });
  },
};
