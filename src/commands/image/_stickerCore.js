// Fichier partagé (pas une commande) : logique commune à /sticker et /s.
//
// Contraintes Telegram (sendSticker) : image statique -> WEBP (idéalement
// 512px sur le plus grand côté) ; sticker "vidéo" -> WEBM (VP9, silencieux,
// <= 3s, <= 512px). Ces contraintes diffèrent de celles de WhatsApp
// (webp animé), d'où cette implémentation dédiée.
import fs from 'node:fs';
import { resolveFfmpegPath, tempFilePath, cleanupFile, ffmpegRun } from '../../utils/media.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';
import ffmpeg from 'fluent-ffmpeg';

export async function convertToStaticSticker(bufferIn) {
  await resolveFfmpegPath();
  const inFile = tempFilePath('png');
  const outFile = tempFilePath('webp');
  fs.writeFileSync(inFile, bufferIn);

  try {
    const cmd = ffmpeg(inFile).outputOptions([
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
    ]);
    cmd.save(outFile);
    await ffmpegRun(cmd);
    return fs.readFileSync(outFile);
  } finally {
    cleanupFile(inFile);
    cleanupFile(outFile);
  }
}

export async function convertToVideoSticker(bufferIn, inputExt = 'mp4') {
  await resolveFfmpegPath();
  const inFile = tempFilePath(inputExt);
  const outFile = tempFilePath('webm');
  fs.writeFileSync(inFile, bufferIn);

  try {
    const cmd = ffmpeg(inFile).outputOptions([
      '-t', '3',
      '-an',
      '-c:v', 'libvpx-vp9',
      '-b:v', '250k',
      '-crf', '32',
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=30',
    ]);
    cmd.save(outFile);
    await ffmpegRun(cmd);
    return fs.readFileSync(outFile);
  } finally {
    cleanupFile(inFile);
    cleanupFile(outFile);
  }
}

export async function handleStickerCommand(ctx) {
  const media = await downloadQuotedOrDirectMedia(ctx.msg);
  if (!media || !['image', 'video'].includes(media.type)) {
    await ctx.reply(`❌ Répondez à une image ou une courte vidéo avec ${ctx.prefix}sticker.`);
    return;
  }
  try {
    const buffer =
      media.type === 'video'
        ? await convertToVideoSticker(media.buffer)
        : await convertToStaticSticker(media.buffer);
    await ctx.bot.sendMessage(ctx.chatId, { sticker: buffer }, { quoted: ctx.msg });
  } catch (err) {
    await ctx.reply(errorMessage('Échec de la conversion en sticker (ffmpeg manquant ou média invalide).'));
  }
}
