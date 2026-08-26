// Couche de service IA. Aucune fonctionnalité n'est simulée : si aucune clé
// n'est configurée dans .env, chaque fonction renvoie explicitement
// { ok: false, reason: 'not-configured' } et la commande appelante doit
// afficher un message clair à l'utilisateur (jamais de fausse réponse).

import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ class: 'ai-service' });

export function isAiConfigured() {
  return !!config.ai.apiKey;
}

/**
 * Appelle un endpoint de chat completions compatible OpenAI.
 * @param {string} prompt
 * @param {{system?: string, history?: Array<{role:string,content:string}>}} opts
 */
export async function chatCompletion(prompt, opts = {}) {
  if (!isAiConfigured()) return { ok: false, reason: 'not-configured' };

  const messages = [];
  if (opts.system) messages.push({ role: 'system', content: opts.system });
  if (Array.isArray(opts.history)) messages.push(...opts.history);
  messages.push({ role: 'user', content: prompt });

  try {
    const res = await fetch(config.ai.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.model,
        messages,
        temperature: opts.temperature ?? 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      log.error(`Erreur API IA (${res.status})`, errText.slice(0, 200));
      return { ok: false, reason: 'api-error', status: res.status };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { ok: false, reason: 'empty-response' };

    return { ok: true, text: content.trim() };
  } catch (err) {
    log.error('Échec de connexion à l\'API IA', err.message);
    return { ok: false, reason: 'network-error' };
  }
}

export async function generateImage(prompt) {
  if (!isAiConfigured()) return { ok: false, reason: 'not-configured' };

  try {
    const res = await fetch(config.ai.imageApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.imageModel,
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      log.error(`Erreur API image (${res.status})`, errText.slice(0, 200));
      return { ok: false, reason: 'api-error', status: res.status };
    }

    const data = await res.json();
    const url = data.data?.[0]?.url;
    const b64 = data.data?.[0]?.b64_json;

    if (url) return { ok: true, url };
    if (b64) return { ok: true, buffer: Buffer.from(b64, 'base64') };
    return { ok: false, reason: 'empty-response' };
  } catch (err) {
    log.error('Échec de connexion à l\'API de génération d\'image', err.message);
    return { ok: false, reason: 'network-error' };
  }
}

export function isTtsConfigured() {
  return !!config.ai.ttsApiKey && !!config.ai.ttsApiUrl;
}

export async function textToSpeech(text) {
  if (!isTtsConfigured()) return { ok: false, reason: 'not-configured' };

  try {
    const res = await fetch(config.ai.ttsApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.ttsApiKey}`,
      },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) return { ok: false, reason: 'api-error', status: res.status };

    const buffer = Buffer.from(await res.arrayBuffer());
    return { ok: true, buffer };
  } catch (err) {
    log.error('Échec de connexion à l\'API TTS', err.message);
    return { ok: false, reason: 'network-error' };
  }
}

/** Analyse d'image (vision) : décrit ou répond à une question sur une image, via un modèle multimodal. */
export async function visionCompletion(prompt, imageBase64, mimetype = 'image/jpeg') {
  if (!isAiConfigured()) return { ok: false, reason: 'not-configured' };

  try {
    const res = await fetch(config.ai.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.ai.apiKey}`,
      },
      body: JSON.stringify({
        model: config.ai.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt || 'Décris cette image.' },
              { type: 'image_url', image_url: { url: `data:${mimetype};base64,${imageBase64}` } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) return { ok: false, reason: 'api-error', status: res.status };

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { ok: false, reason: 'empty-response' };

    return { ok: true, text: content.trim() };
  } catch (err) {
    log.error('Échec de connexion à l\'API vision', err.message);
    return { ok: false, reason: 'network-error' };
  }
}
