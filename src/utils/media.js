import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import ffmpeg from 'fluent-ffmpeg';
import { config } from '../config.js';
import { logger } from './logger.js';
import { shortId } from './helpers.js';

const log = logger.child({ class: 'media' });

let resolvedFfmpegPath = null;

/** Résout le chemin du binaire ffmpeg : FFMPEG_PATH > ffmpeg-static > "ffmpeg" (PATH système). */
export async function resolveFfmpegPath() {
  if (resolvedFfmpegPath) return resolvedFfmpegPath;

  if (config.ffmpegPath) {
    resolvedFfmpegPath = config.ffmpegPath;
  } else {
    try {
      const mod = await import('ffmpeg-static');
      resolvedFfmpegPath = mod.default || mod;
    } catch {
      resolvedFfmpegPath = 'ffmpeg'; // suppose présent dans le PATH (Termux: pkg install ffmpeg)
    }
  }

  ffmpeg.setFfmpegPath(resolvedFfmpegPath);
  return resolvedFfmpegPath;
}

export function getTempDir() {
  const dir = path.join(os.tmpdir(), 'hsa-bot');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function tempFilePath(ext = '') {
  return path.join(getTempDir(), `${Date.now()}-${shortId()}${ext ? `.${ext}` : ''}`);
}

export function writeTempFile(buffer, ext = '') {
  const file = tempFilePath(ext);
  fs.writeFileSync(file, buffer);
  return file;
}

export function cleanupFile(file) {
  try {
    if (file && fs.existsSync(file)) fs.unlinkSync(file);
  } catch (err) {
    log.warn(`Nettoyage du fichier temporaire échoué : ${file}`, err.message);
  }
}

/**
 * Localise le média Telegram présent dans le message lui-même OU dans le
 * message cité (reply_to_message). Retourne { type, fileId, mimetype } ou null.
 */
export function getMediaMessage(msg) {
  const candidates = [msg, msg.reply_to_message].filter(Boolean);

  for (const m of candidates) {
    if (m.photo?.length) {
      const largest = m.photo[m.photo.length - 1];
      return { type: 'image', fileId: largest.file_id, mimetype: 'image/jpeg' };
    }
    if (m.video) {
      return { type: 'video', fileId: m.video.file_id, mimetype: m.video.mime_type || 'video/mp4' };
    }
    if (m.animation) {
      return { type: 'video', fileId: m.animation.file_id, mimetype: m.animation.mime_type || 'video/mp4' };
    }
    if (m.voice) {
      return { type: 'audio', fileId: m.voice.file_id, mimetype: m.voice.mime_type || 'audio/ogg' };
    }
    if (m.audio) {
      return { type: 'audio', fileId: m.audio.file_id, mimetype: m.audio.mime_type || 'audio/mpeg' };
    }
    if (m.sticker) {
      return {
        type: 'sticker',
        fileId: m.sticker.file_id,
        mimetype: m.sticker.is_animated || m.sticker.is_video ? 'application/octet-stream' : 'image/webp',
        animated: !!(m.sticker.is_animated || m.sticker.is_video),
      };
    }
    if (m.document) {
      return { type: 'document', fileId: m.document.file_id, mimetype: m.document.mime_type || 'application/octet-stream' };
    }
  }

  return null;
}

let telegramBotRef = null;

/** Appelé une fois au démarrage (voir handlers/connectionHandler.js). */
export function setTelegramBot(bot) {
  telegramBotRef = bot;
}

/** Télécharge le média (image/vidéo/audio/sticker/document) présent ou cité dans le message. */
export async function downloadQuotedOrDirectMedia(msg) {
  const found = getMediaMessage(msg);
  if (!found) return null;
  if (!telegramBotRef) throw new Error('Adaptateur Telegram non initialisé.');

  const fileLink = await telegramBotRef.raw.getFileLink(found.fileId);
  const res = await fetch(fileLink);
  if (!res.ok) throw new Error(`Téléchargement du fichier Telegram échoué (${res.status}).`);
  const buffer = Buffer.from(await res.arrayBuffer());

  return { type: found.type, buffer, mimetype: found.mimetype, animated: found.animated };
}

export function ffmpegRun(builder) {
  return new Promise((resolve, reject) => {
    builder
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}
