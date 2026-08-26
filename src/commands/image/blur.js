import { blurImage } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'blur',
  aliases: [],
  category: 'image',
  description: 'Applique un flou à une image. Usage : /blur [intensité 1-40]',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}blur.`);
      return;
    }
    try {
      const out = await blurImage(media.buffer, Number(ctx.args[0]) || 6);
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec du flou.'));
    }
  },
};
