import { toGif } from '../../services/video.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'gif',
  aliases: [],
  category: 'video',
  description: 'Convertit une courte vidéo en GIF animé.',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'video') {
      await ctx.reply(`❌ Répondez à une vidéo avec ${ctx.prefix}gif.`);
      return;
    }
    try {
      const out = await toGif(media.buffer);
      await ctx.bot.sendMessage(ctx.chatId, { video: out, gifPlayback: true }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la conversion en GIF.'));
    }
  },
};
