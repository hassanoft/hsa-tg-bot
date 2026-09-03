// Non une commande : helper partagé pour les jeux animés natifs Telegram
// (sendDice). La valeur du résultat est déterminée par Telegram lui-même,
// jamais par le bot — H$Λ BOT se contente de relayer et de commenter.
import { errorMessage } from '../../utils/formatter.js';

export async function sendDiceGame(ctx, emoji, describe) {
  try {
    const sent = await ctx.bot.sendMessage(ctx.chatId, { dice: emoji }, { quoted: ctx.msg });
    const value = sent.key.diceValue;
    if (typeof value !== 'number') return; // animation envoyée, valeur non exposée par ce fork : rien à ajouter
    const comment = describe(value);
    if (comment) await ctx.reply(comment);
  } catch {
    await ctx.reply(errorMessage("Échec de l'envoi du jeu."));
  }
}