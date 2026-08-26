import { extractAudioTrack } from '../../services/video.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'mp3',
  aliases: [],
  category: 'video',
  description: "Extrait la piste audio d'une vidéo au format MP3.",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'video') {
      await ctx.reply(`❌ Répondez à une vidéo avec ${ctx.prefix}mp3.`);
      return;
    }
    try {
      const out = await extractAudioTrack(media.buffer, 'mp4', { toMp3: true });
      await ctx.bot.sendMessage(ctx.chatId, { audio: out, mimetype: 'audio/mpeg' }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage("Échec de l'extraction audio."));
    }
  },
};
