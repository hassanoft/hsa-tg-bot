export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) out.push(array.slice(i, i + size));
  return out;
}

export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

export function truncate(str = '', max = 300) {
  if (str.length <= max) return str;
  return `${str.slice(0, max - 1)}…`;
}

/** Génère un identifiant lisible court (utilisé pour corréler des messages, etc.) */
export function shortId() {
  return Math.random().toString(36).slice(2, 10);
}

export function escapeHtml(str = '') {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Formate une mention Telegram cliquable (fonctionne même sans @username,
 * contrairement à une simple "@username" — utilise l'identifiant numérique).
 * Nécessite `parse_mode: 'HTML'` sur le sendMessage correspondant.
 */
export function formatMention(userId, name = 'utilisateur') {
  return `<a href="tg://user?id=${userId}">${escapeHtml(name || 'utilisateur')}</a>`;
}
