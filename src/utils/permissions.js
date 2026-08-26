import { config, isOwner } from '../config.js';
import { db } from '../database/database.js';

export const LEVELS = { OWNER: 3, ADMIN: 2, USER: 1 };

/**
 * Vérifie si un userId est l'OWNER configuré (.env OWNER_ID).
 * Vérification faite côté serveur — jamais confiée au client / au menu.
 */
export function checkOwner(userId) {
  return isOwner(userId);
}

/** ADMIN applicatif H$Λ BOT (ajouté via /addadmin), distinct des admins du groupe Telegram. */
export function checkBotAdmin(userId) {
  return checkOwner(userId) || db.isBotAdmin(userId);
}

export function getPermissionLevel(userId, isSenderGroupAdmin) {
  if (checkOwner(userId)) return LEVELS.OWNER;
  if (checkBotAdmin(userId) || isSenderGroupAdmin) return LEVELS.ADMIN;
  return LEVELS.USER;
}

/**
 * Vérifie les permissions requises par une commande contre le contexte d'exécution.
 * Retourne { allowed: boolean, reason?: string }
 * Ne dépend que de booléens déjà calculés sur ctx par messageHandler.js
 * (isGroup, isOwner, isBotAdmin, isSenderGroupAdmin, isBotGroupAdmin) — cette
 * fonction est donc totalement indépendante de la plateforme (WhatsApp/Telegram).
 */
export function checkCommandPermissions(command, ctx) {
  if (command.groupOnly && !ctx.isGroup) {
    return { allowed: false, reason: 'group' };
  }
  if (command.privateOnly && ctx.isGroup) {
    return { allowed: false, reason: 'private' };
  }
  if (command.ownerOnly && !ctx.isOwner) {
    return { allowed: false, reason: 'owner' };
  }
  if (command.adminOnly && !ctx.isOwner && !ctx.isBotAdmin && !ctx.isSenderGroupAdmin) {
    return { allowed: false, reason: 'admin' };
  }
  if (command.requireBotGroupAdmin && ctx.isGroup && !ctx.isBotGroupAdmin) {
    return { allowed: false, reason: 'bot-admin' };
  }
  return { allowed: true };
}

export { config };
