// Service image : traitements locaux réels via Jimp (aucune dépendance
// native, compatible Termux) + intégrations externes optionnelles pour
// les fonctions qui nécessitent réellement un modèle IA (suppression de
// fond, upscaling IA).

import Jimp from 'jimp';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ class: 'image-service' });

async function load(buffer) {
  return Jimp.read(buffer);
}

export async function resizeImage(buffer, width, height) {
  const img = await load(buffer);
  img.resize(width || Jimp.AUTO, height || Jimp.AUTO);
  return img.getBufferAsync(Jimp.MIME_PNG);
}

export async function cropImage(buffer, width, height, x = 0, y = 0) {
  const img = await load(buffer);
  const w = Math.min(width, img.bitmap.width - x);
  const h = Math.min(height, img.bitmap.height - y);
  img.crop(x, y, w, h);
  return img.getBufferAsync(Jimp.MIME_PNG);
}

export async function rotateImage(buffer, degrees) {
  const img = await load(buffer);
  img.rotate(Number(degrees) || 90);
  return img.getBufferAsync(Jimp.MIME_PNG);
}

export async function mirrorImage(buffer, horizontal = true) {
  const img = await load(buffer);
  img.flip(horizontal, !horizontal);
  return img.getBufferAsync(Jimp.MIME_PNG);
}

export async function blurImage(buffer, radius = 6) {
  const img = await load(buffer);
  img.blur(Math.max(1, Math.min(40, Number(radius) || 6)));
  return img.getBufferAsync(Jimp.MIME_PNG);
}

/** Amélioration locale réelle (contraste, netteté, normalisation), sans IA externe. */
export async function enhanceImage(buffer) {
  const img = await load(buffer);
  img
    .normalize()
    .contrast(0.15)
    .brightness(0.03)
    .convolute([
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ]);
  return img.getBufferAsync(Jimp.MIME_PNG);
}

/** Upscaling classique par interpolation bicubique (toujours disponible, sans clé API). */
export async function basicUpscale(buffer, factor = 2) {
  const img = await load(buffer);
  const w = Math.min(img.bitmap.width * factor, 4096);
  const h = Math.min(img.bitmap.height * factor, 4096);
  img.resize(w, h, Jimp.RESIZE_BICUBIC);
  return img.getBufferAsync(Jimp.MIME_PNG);
}

export function isUpscaleAiConfigured() {
  return !!config.image.upscaleUrl;
}

export async function aiUpscale(buffer) {
  if (!isUpscaleAiConfigured()) return { ok: false, reason: 'not-configured' };
  try {
    const res = await fetch(config.image.upscaleUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        ...(config.image.upscaleKey ? { Authorization: `Bearer ${config.image.upscaleKey}` } : {}),
      },
      body: buffer,
    });
    if (!res.ok) return { ok: false, reason: 'api-error', status: res.status };
    const out = Buffer.from(await res.arrayBuffer());
    return { ok: true, buffer: out };
  } catch (err) {
    log.error('Échec upscale IA', err.message);
    return { ok: false, reason: 'network-error' };
  }
}

export function isRemoveBgConfigured() {
  return !!config.image.removeBgKey;
}

export async function removeBackground(buffer) {
  if (!isRemoveBgConfigured()) return { ok: false, reason: 'not-configured' };
  try {
    const form = new FormData();
    form.append('image_file', new Blob([buffer]), 'image.png');
    form.append('size', 'auto');

    const res = await fetch(config.image.removeBgUrl, {
      method: 'POST',
      headers: { 'X-Api-Key': config.image.removeBgKey },
      body: form,
    });

    if (!res.ok) return { ok: false, reason: 'api-error', status: res.status };
    const out = Buffer.from(await res.arrayBuffer());
    return { ok: true, buffer: out };
  } catch (err) {
    log.error('Échec suppression de fond', err.message);
    return { ok: false, reason: 'network-error' };
  }
}

async function getFont(size = 32, color = 'WHITE') {
  const map = {
    32: Jimp[`FONT_SANS_32_${color}`],
    64: Jimp[`FONT_SANS_64_${color}`],
    16: Jimp[`FONT_SANS_16_${color}`],
  };
  return Jimp.loadFont(map[size] || Jimp.FONT_SANS_32_WHITE);
}

/** Style "meme" classique : texte en haut / en bas, en majuscules. */
export async function addCaption(buffer, { top = '', bottom = '' }) {
  const img = await load(buffer);
  const fontSize = img.bitmap.width > 600 ? 64 : 32;
  const font = await getFont(fontSize, 'WHITE');

  if (top) {
    img.print(font, 0, 10, { text: top.toUpperCase(), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, img.bitmap.width);
  }
  if (bottom) {
    img.print(
      font,
      0,
      img.bitmap.height - fontSize - 20,
      { text: bottom.toUpperCase(), alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      img.bitmap.width
    );
  }
  return img.getBufferAsync(Jimp.MIME_PNG);
}

/** Bannière "WANTED" façon avis de recherche, avec un nom en légende. */
export async function wantedPoster(buffer, name = '') {
  const img = await load(buffer);
  img.greyscale().contrast(0.2);
  const font = await getFont(64, 'WHITE');
  const smallFont = await getFont(32, 'WHITE');

  img.print(font, 0, 8, { text: 'WANTED', alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, img.bitmap.width);
  if (name) {
    img.print(
      smallFont,
      0,
      img.bitmap.height - 48,
      { text: name, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER },
      img.bitmap.width
    );
  }
  return img.getBufferAsync(Jimp.MIME_PNG);
}

/** Redimensionne l'image pour un format fond d'écran courant (portrait mobile), en "cover". */
export async function toWallpaper(buffer, width = 1080, height = 1920) {
  const img = await load(buffer);
  img.cover(width, height);
  return img.getBufferAsync(Jimp.MIME_PNG);
}

/** Applique un cadre simple + éventuel texte : utilisé pour /logo et /avatar. */
export async function stylize(buffer, { text = '', circle = false } = {}) {
  const img = await load(buffer);
  img.cover(512, 512);
  if (circle) img.circle();
  if (text) {
    const font = await getFont(32, 'WHITE');
    img.print(font, 0, 512 - 48, { text, alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER }, 512);
  }
  return img.getBufferAsync(Jimp.MIME_PNG);
}
