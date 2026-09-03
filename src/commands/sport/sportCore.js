// Non une commande : logique partagée pour la catégorie SPORT.
// Contenu 100% fiable (conseils rédigés, pas de données live) + une photo
// illustrative optionnelle via l'API publique et sans clé de Wikipédia.
import { getJson } from '../../utils/http.js';
import { logger } from '../../utils/logger.js';

const log = logger.child({ class: 'sport' });

async function fetchWikipediaThumbnail(wikiTitle) {
  try {
    const url = `https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const data = await getJson(url, { timeoutMs: 8000, retries: 1 });
    return data?.thumbnail?.source || data?.originalimage?.source || null;
  } catch (err) {
    log.warn(`Échec de récupération de la photo Wikipédia pour "${wikiTitle}"`, err.message);
    return null;
  }
}

function buildTipsText(title, tips, mistakes) {
  return (
    `🏅 ${title}\n\n` +
    `✅ À faire :\n${tips.map((t) => `• ${t}`).join('\n')}\n\n` +
    `❌ À éviter :\n${mistakes.map((m) => `• ${m}`).join('\n')}`
  );
}

/**
 * Envoie les conseils d'un sport, avec une photo illustrative si disponible.
 * Photo et texte sont toujours envoyés séparément (jamais en légende) pour
 * éviter tout risque de dépassement de la limite de légende Telegram.
 */
export async function sendSportAdvice(ctx, { title, wikiTitle, tips, mistakes }) {
  const text = buildTipsText(title, tips, mistakes);
  const photoUrl = await fetchWikipediaThumbnail(wikiTitle);

  if (photoUrl) {
    try {
      await ctx.bot.sendMessage(ctx.chatId, { image: { url: photoUrl }, caption: `🏅 ${title}` }, { quoted: ctx.msg });
      await ctx.reply(text);
      return;
    } catch (err) {
      log.warn('Échec d\'envoi de la photo, repli sur texte seul', err.message);
    }
  }

  await ctx.reply(text);
}
