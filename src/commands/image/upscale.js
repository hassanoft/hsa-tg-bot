import { basicUpscale, aiUpscale, isUpscaleAiConfigured } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage, infoMessage } from '../../utils/formatter.js';

export default {
  name: 'upscale',
  aliases: [],
  category: 'image',
  description: "Agrandit une image (IA si configurée, sinon interpolation bicubique locale).",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}upscale.`);
      return;
    }
    if (isUpscaleAiConfigured()) {
      const result = await aiUpscale(media.buffer);
      if (result.ok) {
        await ctx.bot.sendMessage(ctx.chatId, { image: result.buffer }, { quoted: ctx.msg });
        return;
      }
    }
    try {
      const out = await basicUpscale(media.buffer, 2);
      await ctx.reply(infoMessage('IMAGE_UPSCALE_API_URL non configurée : upscaling classique appliqué.'));
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage("Échec de l'agrandissement de l'image."));
    }
  },
};
