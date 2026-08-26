import { compressVideo } from '../../services/video.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'compress',
  aliases: [],
  category: 'video',
  description: 'Compresse une vidéo pour réduire sa taille.',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'video') {
      await ctx.reply(`❌ Répondez à une vidéo avec ${ctx.prefix}compress.`);
      return;
    }
    await ctx.reply('📦 Compression en cours...');
    try {
      const out = await compressVideo(media.buffer);
      await ctx.bot.sendMessage(ctx.chatId, { video: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la compression.'));
    }
  },
};
