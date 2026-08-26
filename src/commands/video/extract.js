import { extractAudioTrack } from '../../services/video.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'extract',
  aliases: [],
  category: 'video',
  description: "Extrait la piste audio native d'une vidéo (sans réencodage).",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'video') {
      await ctx.reply(`❌ Répondez à une vidéo avec ${ctx.prefix}extract.`);
      return;
    }
    try {
      const out = await extractAudioTrack(media.buffer, 'mp4', { toMp3: false });
      await ctx.bot.sendMessage(ctx.chatId, { document: out, mimetype: 'audio/mp4', fileName: 'audio.m4a' }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage("Échec de l'extraction."));
    }
  },
};
