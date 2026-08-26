// Service de téléchargement.
//
// - Pour YouTube / TikTok / Instagram / Facebook / Twitter : ces plateformes
//   protègent activement leur contenu contre le scraping. Pour rester
//   conforme à leurs CGU (voir section 17 des consignes : "ne jamais
//   contourner une protection"), ce service délègue à une API tierce
//   configurable par l'opérateur du bot (DOWNLOAD_API_URL / DOWNLOAD_API_KEY),
//   à charge pour lui de choisir un fournisseur conforme aux CGU des
//   plateformes. Sans configuration, la commande renvoie une erreur claire.
//
// - Pour MediaFire / Google Drive : la résolution de lien direct est faite
//   ici de façon 100% légitime (ce sont des mécanismes que ces services
//   exposent eux-mêmes publiquement pour le téléchargement direct).

import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ class: 'downloader-service' });

export function isDownloadApiConfigured() {
  return !!config.download.apiUrl;
}

/**
 * Appelle l'API tierce configurée pour résoudre un lien de téléchargement.
 * @param {'youtube'|'youtube-audio'|'tiktok'|'instagram'|'facebook'|'twitter'|'search'} kind
 * @param {string} query URL ou requête de recherche
 */
export async function resolveViaApi(kind, query) {
  if (!isDownloadApiConfigured()) return { ok: false, reason: 'not-configured' };

  try {
    const url = new URL(config.download.apiUrl);
    url.searchParams.set('type', kind);
    url.searchParams.set('q', query);

    const res = await fetch(url, {
      headers: config.download.apiKey ? { Authorization: `Bearer ${config.download.apiKey}` } : {},
    });

    if (!res.ok) return { ok: false, reason: 'api-error', status: res.status };
    const data = await res.json();
    if (!data?.url) return { ok: false, reason: 'not-found' };

    return { ok: true, downloadUrl: data.url, title: data.title, thumbnail: data.thumbnail };
  } catch (err) {
    log.error(`Échec resolveViaApi(${kind})`, err.message);
    return { ok: false, reason: 'network-error' };
  }
}

/** Résout le lien de téléchargement direct MediaFire depuis sa page de partage publique. */
export async function resolveMediafire(shareUrl) {
  try {
    const res = await fetch(shareUrl);
    if (!res.ok) return { ok: false, reason: 'not-found' };
    const html = await res.text();
    const match = html.match(/href="(https:\/\/download[^"]+mediafire\.com[^"]+)"/i);
    if (!match) return { ok: false, reason: 'not-found' };
    return { ok: true, downloadUrl: match[1] };
  } catch (err) {
    log.error('Échec resolveMediafire', err.message);
    return { ok: false, reason: 'network-error' };
  }
}

/** Construit le lien de téléchargement direct Google Drive à partir d'un lien de partage. */
export function resolveGoogleDrive(shareUrl) {
  const match = shareUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || shareUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (!match) return { ok: false, reason: 'invalid-link' };
  const fileId = match[1];
  return { ok: true, downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}` };
}
