import { probeAudio } from '../../services/audio.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'audioinfo',
  aliases: [],
  category: 'audio',
  description: "Affiche les informations techniques d'un fichier audio.",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'audio') {
      await ctx.reply(`❌ Répondez à un audio avec ${ctx.prefix}audioinfo.`);
      return;
    }
    try {
      const data = await probeAudio(media.buffer, 'mp3');
      const stream = data.streams?.find((s) => s.codec_type === 'audio') || {};
      await ctx.reply(
        `🎧 Informations audio\n\n` +
        `⏱️ Durée : ${Number(data.format?.duration || 0).toFixed(1)}s\n` +
        `🎚️ Codec : ${stream.codec_name || 'inconnu'}\n` +
        `📶 Débit : ${data.format?.bit_rate ? `${Math.round(data.format.bit_rate / 1000)} kbps` : 'inconnu'}\n` +
        `🔊 Canaux : ${stream.channels || 'inconnu'}`
      );
    } catch {
      await ctx.reply(errorMessage("Échec de l'analyse audio."));
    }
  },
};
