// Non une commande : helpers partagés pour extraire les identifiants ciblés
// dans une commande de groupe.
//
// LIMITATION TELEGRAM : une simple mention "@username" dans un texte ne donne
// pas accès à l'identifiant numérique de l'utilisateur via l'API Bot (une
// entité de type "mention" ne contient qu'une chaîne de texte). Seules deux
// méthodes fiables existent : répondre au message de la personne visée, ou
// la mentionner via une "text_mention" (mention sans @username, produite par
// certains clients Telegram), qui elle inclut directement l'objet utilisateur.
export function getTargetIds(ctx) {
  const replyUser = ctx.msg.reply_to_message?.from;
  if (replyUser) return [String(replyUser.id)];

  const entities = ctx.msg.entities || [];
  const textMention = entities.find((e) => e.type === 'text_mention' && e.user);
  if (textMention) return [String(textMention.user.id)];

  if (ctx.args[0]) {
    const digits = ctx.args[0].replace(/\D/g, '');
    if (digits) return [digits];
  }

  return [];
}
