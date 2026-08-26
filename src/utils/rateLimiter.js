import { config } from '../config.js';

// Fenêtre glissante en mémoire, par utilisateur (jid).
// Objectif : éviter les abus, protéger les APIs externes, empêcher les
// boucles de commandes et réduire les appels excessifs (section 40).

const hits = new Map(); // jid -> timestamps[]

export function isRateLimited(jid, { max = config.rateLimit.max, windowMs = config.rateLimit.windowMs } = {}) {
  const now = Date.now();
  const list = (hits.get(jid) || []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(jid, list);
  return list.length > max;
}

export function resetRateLimit(jid) {
  hits.delete(jid);
}

// Nettoyage périodique pour éviter une fuite mémoire sur un process longue durée
setInterval(() => {
  const now = Date.now();
  for (const [jid, list] of hits.entries()) {
    const filtered = list.filter((t) => now - t < config.rateLimit.windowMs);
    if (filtered.length === 0) hits.delete(jid);
    else hits.set(jid, filtered);
  }
}, 60_000).unref();
