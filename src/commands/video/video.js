import { toMp4 } from '../../services/video.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'video',
  aliases: [],
  category: 'video',
  description: 'Convertit un GIF/sticker animé en fichier vidéo MP4 standard.',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || !['video', 'sticker'].includes(media.type)) {
      await ctx.reply(`❌ Répondez à une vidéo ou un sticker animé avec ${ctx.prefix}video.`);
      return;
    }
    try {
      const out = await toMp4(media.buffer, media.type === 'sticker' ? 'webp' : 'mp4');
      await ctx.bot.sendMessage(ctx.chatId, { video: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la conversion vidéo (ffmpeg manquant ou média invalide).'));
    }
  },
};
