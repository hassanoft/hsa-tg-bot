// Service audio : traitements réels via ffmpeg + paroles via API publique
// sans clé (lyrics.ovh). La recherche/lecture de musique (/play, /song)
// passe par le service downloader.js, configurable et honnête sur les
// limites (voir section 17 du cahier des charges).

import ffmpeg from 'fluent-ffmpeg';
import fs from 'node:fs';
import { resolveFfmpegPath, tempFilePath, cleanupFile, ffmpegRun } from '../utils/media.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ class: 'audio-service' });

async function runToFile(inputBuffer, inputExt, outputExt, build) {
  await resolveFfmpegPath();
  const inFile = tempFilePath(inputExt);
  const outFile = tempFilePath(outputExt);
  fs.writeFileSync(inFile, inputBuffer);
  try {
    const command = ffmpeg(inFile);
    build(command);
    command.save(outFile);
    await ffmpegRun(command);
    return fs.readFileSync(outFile);
  } finally {
    cleanupFile(inFile);
    cleanupFile(outFile);
  }
}

export async function toMp3(bufferIn, inputExt = 'ogg') {
  return runToFile(bufferIn, inputExt, 'mp3', (cmd) => {
    cmd.outputOptions(['-c:a libmp3lame', '-q:a 2']);
  });
}

/** Convertit un audio en note vocale Telegram (ogg/opus). */
export async function toVoiceNote(bufferIn, inputExt = 'mp3') {
  return runToFile(bufferIn, inputExt, 'ogg', (cmd) => {
    cmd.outputOptions(['-c:a libopus', '-b:a 64k', '-vn']);
  });
}

export async function bassBoost(bufferIn, inputExt = 'mp3', gain = 15) {
  return runToFile(bufferIn, inputExt, 'mp3', (cmd) => {
    cmd.audioFilters(`bass=g=${Math.max(0, Math.min(30, Number(gain) || 15))}`);
    cmd.outputOptions(['-c:a libmp3lame']);
  });
}

export async function changeSpeed(bufferIn, inputExt = 'mp3', factor = 1.5) {
  const f = Math.max(0.5, Math.min(3, Number(factor) || 1.5));
  return runToFile(bufferIn, inputExt, 'mp3', (cmd) => {
    cmd.audioFilters(`atempo=${f}`);
    cmd.outputOptions(['-c:a libmp3lame']);
  });
}

export async function probeAudio(bufferIn, inputExt = 'mp3') {
  await resolveFfmpegPath();
  const inFile = tempFilePath(inputExt);
  fs.writeFileSync(inFile, bufferIn);
  try {
    return await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inFile, (err, data) => (err ? reject(err) : resolve(data)));
    });
  } finally {
    cleanupFile(inFile);
  }
}

/** Paroles de chanson via l'API publique et gratuite lyrics.ovh (sans clé). */
export async function getLyrics(artist, title) {
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const res = await fetch(url);
    if (!res.ok) return { ok: false, reason: res.status === 404 ? 'not-found' : 'api-error' };
    const data = await res.json();
    if (!data.lyrics) return { ok: false, reason: 'not-found' };
    return { ok: true, lyrics: data.lyrics.trim() };
  } catch (err) {
    log.error('Échec de récupération des paroles', err.message);
    return { ok: false, reason: 'network-error' };
  }
}
