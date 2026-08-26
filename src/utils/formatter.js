export function formatDuration(ms) {
  let seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  seconds -= days * 86400;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  const parts = [];
  if (days) parts.push(`${days}j`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let value = bytes;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(2)} ${units[i]}`;
}

export function errorMessage(text) {
  return `❌ ${text}`;
}

export function successMessage(text) {
  return `✅ ${text}`;
}

export function infoMessage(text) {
  return `ℹ️ ${text}`;
}

export function ownerOnlyMessage() {
  return errorMessage('Cette commande est réservée au propriétaire du bot.');
}

export function adminOnlyMessage() {
  return errorMessage('Cette commande est réservée aux administrateurs.');
}

export function groupOnlyMessage() {
  return errorMessage('Cette commande fonctionne uniquement dans un groupe.');
}

export function botAdminRequiredMessage() {
  return errorMessage("H$Λ BOT doit être administrateur du groupe pour exécuter cette action.");
}

export function unknownCommandMessage(prefix) {
  return `❌ Commande inconnue.\n\nUtilisez ${prefix}help pour voir les commandes disponibles.`;
}

export function maintenanceMessage() {
  return '🛠️ H$Λ BOT est actuellement en maintenance.\nMerci de réessayer plus tard.';
}

export function contactOwnerTemplate({ userName, userId, message }) {
  return (
    `╭──────────────────────────────╮\n` +
    `│       📩 H$Λ BOT CONTACT     │\n` +
    `╰──────────────────────────────╯\n\n` +
    `👤 User : ${userName}\n` +
    `🆔 ID : ${userId}\n` +
    `💬 Message :\n\n` +
    `${message}\n\n` +
    `────────────────────────────────\n` +
    `↩️ Répondez directement à ce message\n` +
    `pour répondre à l'utilisateur.\n` +
    `────────────────────────────────`
  );
}

export function contactMediaOwnerTemplate({ userName, userId, mediaType }) {
  return (
    `╭──────────────────────────────╮\n` +
    `│       📩 H$Λ BOT CONTACT     │\n` +
    `╰──────────────────────────────╯\n\n` +
    `👤 User : ${userName}\n` +
    `🆔 ID : ${userId}\n` +
    `📎 Type de média : ${mediaType}\n\n` +
    `────────────────────────────────\n` +
    `↩️ Répondez directement à ce message\n` +
    `pour répondre à l'utilisateur.\n` +
    `────────────────────────────────`
  );
}

export function contactUserReplyTemplate(replyText) {
  return (
    `╭──────────────────────────────╮\n` +
    `│        📩 H$Λ BOT            │\n` +
    `╰──────────────────────────────╯\n\n` +
    `👑 Réponse de l'administrateur :\n\n` +
    `${replyText}\n\n` +
    `────────────────────────────────\n` +
    `H$Λ BOT\n` +
    `────────────────────────────────`
  );
}
