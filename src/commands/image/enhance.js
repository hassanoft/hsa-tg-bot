import { enhanceImage } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'enhance',
  aliases: [],
  category: 'image',
  description: "Améliore le contraste et la netteté d'une image (traitement local réel).",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}enhance.`);
      return;
    }
    try {
      const out = await enhanceImage(media.buffer);
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage("Échec de l'amélioration de l'image."));
    }
  },
};
