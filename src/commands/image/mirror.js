import { mirrorImage } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'mirror',
  aliases: ['flip'],
  category: 'image',
  description: 'Retourne une image horizontalement (effet miroir).',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}mirror.`);
      return;
    }
    try {
      const out = await mirrorImage(media.buffer, true);
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec du miroir.'));
    }
  },
};
