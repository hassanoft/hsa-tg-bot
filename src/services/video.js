// Service vidéo : traitements réels via ffmpeg (fluent-ffmpeg). Nécessite le
// binaire ffmpeg (résolu automatiquement, voir utils/media.js).

import ffmpeg from 'fluent-ffmpeg';
import fs from 'node:fs';
import path from 'node:path';
import { resolveFfmpegPath, tempFilePath, cleanupFile, ffmpegRun } from '../utils/media.js';

async function withFfmpeg() {
  await resolveFfmpegPath();
}

async function runToFile(inputBuffer, inputExt, outputExt, build) {
  await withFfmpeg();
  const inFile = tempFilePath(inputExt);
  const outFile = tempFilePath(outputExt);
  fs.writeFileSync(inFile, inputBuffer);
  try {
    const command = ffmpeg(inFile);
    build(command, inFile, outFile);
    command.save(outFile);
    await ffmpegRun(command);
    return fs.readFileSync(outFile);
  } finally {
    cleanupFile(inFile);
    cleanupFile(outFile);
  }
}

export async function toMp4(bufferIn, inputExt = 'bin') {
  return runToFile(bufferIn, inputExt, 'mp4', (cmd) => {
    cmd.outputOptions(['-c:v libx264', '-pix_fmt yuv420p', '-c:a aac']);
  });
}

export async function toGif(bufferIn, inputExt = 'mp4') {
  return runToFile(bufferIn, inputExt, 'gif', (cmd) => {
    cmd.outputOptions(['-vf', 'fps=12,scale=480:-1:flags=lanczos', '-t', '10']);
  });
}

export async function trimVideo(bufferIn, inputExt = 'mp4', startSec = 0, durationSec = 10) {
  return runToFile(bufferIn, inputExt, 'mp4', (cmd) => {
    cmd.setStartTime(startSec).setDuration(durationSec).outputOptions(['-c copy']);
  });
}

export async function compressVideo(bufferIn, inputExt = 'mp4') {
  return runToFile(bufferIn, inputExt, 'mp4', (cmd) => {
    cmd.outputOptions(['-vcodec libx264', '-crf 30', '-preset veryfast', '-vf', 'scale=640:-2']);
  });
}

export async function muteVideo(bufferIn, inputExt = 'mp4') {
  return runToFile(bufferIn, inputExt, 'mp4', (cmd) => {
    cmd.outputOptions(['-an', '-c:v copy']);
  });
}

export async function extractAudioTrack(bufferIn, inputExt = 'mp4', { toMp3 = false } = {}) {
  return runToFile(bufferIn, inputExt, toMp3 ? 'mp3' : 'm4a', (cmd) => {
    if (toMp3) cmd.outputOptions(['-vn', '-c:a libmp3lame', '-q:a 2']);
    else cmd.outputOptions(['-vn', '-c:a copy']);
  });
}

export async function extractThumbnail(bufferIn, inputExt = 'mp4', atSeconds = 1) {
  await withFfmpeg();
  const inFile = tempFilePath(inputExt);
  const outFile = tempFilePath('jpg');
  fs.writeFileSync(inFile, bufferIn);
  try {
    await new Promise((resolve, reject) => {
      ffmpeg(inFile)
        .on('end', resolve)
        .on('error', reject)
        .screenshots({ timestamps: [atSeconds], filename: path.basename(outFile), folder: path.dirname(outFile) });
    });
    return fs.readFileSync(outFile);
  } finally {
    cleanupFile(inFile);
    cleanupFile(outFile);
  }
}

export async function probeMedia(bufferIn, inputExt = 'mp4') {
  await withFfmpeg();
  const inFile = tempFilePath(inputExt);
  fs.writeFileSync(inFile, bufferIn);
  try {
    return await new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inFile, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  } finally {
    cleanupFile(inFile);
  }
}
