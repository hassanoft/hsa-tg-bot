import { extractThumbnail } from '../../services/video.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'thumbnail',
  aliases: ['thumb'],
  category: 'video',
  description: "Extrait une image (miniature) d'une vidéo. Usage : /thumbnail [secondes]",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'video') {
      await ctx.reply(`❌ Répondez à une vidéo avec ${ctx.prefix}thumbnail [secondes].`);
      return;
    }
    try {
      const out = await extractThumbnail(media.buffer, 'mp4', Number(ctx.args[0]) || 1);
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage("Échec de l'extraction de la miniature."));
    }
  },
};
