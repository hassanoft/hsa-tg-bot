import fs from 'node:fs';
import ffmpeg from 'fluent-ffmpeg';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { resolveFfmpegPath, tempFilePath, cleanupFile, ffmpegRun } from '../../utils/media.js';
import { extractThumbnail } from '../../services/video.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'toimg',
  aliases: [],
  category: 'image',
  description: 'Convertit un sticker en image (PNG).',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'sticker') {
      await ctx.reply(`❌ Répondez à un sticker avec ${ctx.prefix}toimg.`);
      return;
    }

    try {
      if (media.animated) {
        // Sticker "vidéo" (WEBM) : on extrait la première image.
        const out = await extractThumbnail(media.buffer, 'webm', 0);
        await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
        return;
      }

      // Sticker statique (WEBP) -> PNG via ffmpeg (décodage fiable, contrairement à Jimp).
      await resolveFfmpegPath();
      const inFile = tempFilePath('webp');
      const outFile = tempFilePath('png');
      fs.writeFileSync(inFile, media.buffer);
      try {
        const cmd = ffmpeg(inFile);
        cmd.save(outFile);
        await ffmpegRun(cmd);
        const png = fs.readFileSync(outFile);
        await ctx.bot.sendMessage(ctx.chatId, { image: png }, { quoted: ctx.msg });
      } finally {
        cleanupFile(inFile);
        cleanupFile(outFile);
      }
    } catch {
      await ctx.reply(errorMessage('Échec de la conversion de ce sticker en image.'));
    }
  },
};
