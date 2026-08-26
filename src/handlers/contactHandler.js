import { logger } from '../utils/logger.js';
import { successMessage, errorMessage } from '../utils/formatter.js';
import { downloadQuotedOrDirectMedia } from '../utils/media.js';
import {
  handleOwnerReply,
  isPending,
  consumePending,
  forwardTextToOwner,
  forwardMediaToOwner,
} from '../services/contact.js';

const log = logger.child({ class: 'contactHandler' });

/**
 * Tente de traiter le message courant dans le cadre du système /contact :
 *  1) réponse de OWNER à un message de contact (fonction "Répondre" de Telegram)
 *  2) contenu envoyé par un utilisateur après avoir déclenché le "mode attente" de /contact
 * Retourne true si le message a été entièrement pris en charge (aucun autre
 * traitement — commande, modération — ne doit alors être effectué).
 */
export async function tryHandleContactFlow(bot, ctx) {
  const { msg, senderId, chatId, isGroup, text } = ctx;

  // 1) Réponse de OWNER
  try {
    const handled = await handleOwnerReply(bot, ctx);
    if (handled) return true;
  } catch (err) {
    log.error("Erreur pendant le traitement d'une réponse OWNER", err.message);
  }

  // 2) Contenu attendu suite à /contact (mode 2)
  if (isGroup) return false; // le contact ne s'utilise qu'en privé avec le bot
  if (!isPending(senderId)) return false;

  const consumed = consumePending(senderId);
  if (!consumed) return false;

  const media = await downloadQuotedOrDirectMedia(msg).catch(() => null);

  if (media) {
    const result = await forwardMediaToOwner(bot, {
      userId: senderId,
      userName: ctx.pushName || senderId,
      mediaType: media.type,
      buffer: media.buffer,
      mimetype: media.mimetype,
      caption: text || '',
    });
    await replyForResult(bot, chatId, result);
    return true;
  }

  if (text && text.trim()) {
    const result = await forwardTextToOwner(bot, {
      userId: senderId,
      userName: ctx.pushName || senderId,
      text: text.trim(),
    });
    await replyForResult(bot, chatId, result);
    return true;
  }

  return false;
}

async function replyForResult(bot, chatId, result) {
  if (result.ok) {
    await bot.sendMessage(chatId, { text: successMessage('Votre message a bien été transmis au propriétaire de H$Λ BOT.') });
    return;
  }
  const reasons = {
    'no-owner': "Le propriétaire du bot n'est pas configuré pour le moment.",
    'too-large': 'Le média est trop volumineux pour être transmis.',
    'owner-unreachable':
      "Le propriétaire n'a pas encore démarré de conversation avec le bot (limitation Telegram : un bot ne peut pas écrire en premier à un utilisateur).",
  };
  await bot.sendMessage(chatId, {
    text: errorMessage(reasons[result.reason] || "Échec de l'envoi de votre message."),
  });
}
