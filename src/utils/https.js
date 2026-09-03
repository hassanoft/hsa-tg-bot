// Client HTTP partagé — évite de dupliquer la logique réseau dans chaque
// commande. Basé sur fetch() natif (Node >= 18), aucune dépendance
// supplémentaire nécessaire pour les requêtes JSON/HTML.
//
// Fournit : GET / POST / HEAD, parsing JSON/texte, téléchargement en stream
// (jamais entièrement en RAM), timeout, retry avec backoff, User-Agent par
// défaut, en-têtes personnalisés, et une gestion explicite des codes
// 403 / 404 / 429 / 5xx (voir HttpError ci-dessous).

import fs from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable, Transform } from 'node:stream';
import { config } from '../config.js';
import { logger } from './logger.js';

const log = logger.child({ class: 'http' });

export class HttpError extends Error {
  constructor(message, { status, url, retryable = false } = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
    this.retryable = retryable;
  }
}

function defaultHeaders(extra = {}) {
  return {
    'User-Agent': config.http.userAgent,
    Accept: '*/*',
    ...extra,
  };
}

function isRetryableStatus(status) {
  return status === 429 || status === 408 || (status >= 500 && status <= 599);
}

async function fetchWithTimeout(url, opts, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Effectue une requête HTTP avec retry automatique sur erreurs réseau/5xx/429.
 * N'effectue JAMAIS de retry sur 403/404 (échecs déterministes — inutile de réessayer).
 */
export async function request(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeoutMs = config.http.timeoutMs,
    retries = config.http.retries,
  } = options;

  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const res = await fetchWithTimeout(
        url,
        { method, headers: defaultHeaders(headers), body },
        timeoutMs
      );

      if (!res.ok && isRetryableStatus(res.status) && attempt < retries) {
        const retryAfter = Number(res.headers.get('retry-after')) || 0;
        const delay = Math.max(retryAfter * 1000, 500 * 2 ** attempt);
        log.warn(`HTTP ${res.status} sur ${url}, nouvelle tentative dans ${delay}ms (essai ${attempt + 1}/${retries})`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (!res.ok) {
        const reason =
          res.status === 403
            ? 'Accès refusé par le serveur (403).'
            : res.status === 404
              ? 'Ressource introuvable (404).'
              : res.status === 429
                ? 'Trop de requêtes, limite atteinte (429).'
                : `Erreur serveur (${res.status}).`;
        throw new HttpError(reason, { status: res.status, url, retryable: isRetryableStatus(res.status) });
      }

      return res;
    } catch (err) {
      lastErr = err;
      if (err instanceof HttpError) throw err;
      if (attempt < retries) {
        const delay = 500 * 2 ** attempt;
        log.warn(`Erreur réseau sur ${url} (${err.message}), nouvelle tentative dans ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
    }
  }
  throw new HttpError(`Échec réseau après ${retries + 1} tentative(s) : ${lastErr?.message}`, { url, retryable: true });
}

export async function get(url, options = {}) {
  return request(url, { ...options, method: 'GET' });
}

export async function head(url, options = {}) {
  return request(url, { ...options, method: 'HEAD' });
}

export async function post(url, body, options = {}) {
  return request(url, { ...options, method: 'POST', body });
}

export async function getJson(url, options = {}) {
  const res = await get(url, options);
  return res.json();
}

export async function getText(url, options = {}) {
  const res = await get(url, options);
  return res.text();
}

/**
 * Télécharge une URL directement sur disque, EN STREAM (jamais chargé
 * entièrement en RAM), avec une limite de taille stricte et configurable.
 * Retourne { path, bytes, contentType }.
 */
export async function downloadToFile(url, destPath, options = {}) {
  const maxBytes = (options.maxSizeMb ?? config.download.maxSizeMb) * 1024 * 1024;

  const res = await get(url, options);

  const contentLength = Number(res.headers.get('content-length'));
  if (contentLength && contentLength > maxBytes) {
    throw new HttpError(`Fichier trop volumineux (${(contentLength / 1024 / 1024).toFixed(1)} Mo, limite ${options.maxSizeMb ?? config.download.maxSizeMb} Mo).`, {
      url,
      status: 'too-large',
    });
  }

  if (!res.body) throw new HttpError('Réponse sans contenu.', { url });

  let written = 0;
  const nodeReadable = Readable.fromWeb(res.body);
  const writeStream = fs.createWriteStream(destPath);

  const limiter = new Transform({
    transform(chunk, _enc, cb) {
      written += chunk.length;
      if (written > maxBytes) {
        cb(new HttpError(`Téléchargement interrompu : limite de taille dépassée (${options.maxSizeMb ?? config.download.maxSizeMb} Mo).`, { url, status: 'too-large' }));
        return;
      }
      cb(null, chunk);
    },
  });

  try {
    await pipeline(nodeReadable, limiter, writeStream);
  } catch (err) {
    try { fs.unlinkSync(destPath); } catch { /* best effort */ }
    throw err instanceof HttpError ? err : new HttpError(`Échec du téléchargement : ${err.message}`, { url });
  }

  return { path: destPath, bytes: written, contentType: res.headers.get('content-type') || '' };
}
