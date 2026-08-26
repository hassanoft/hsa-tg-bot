import { getTargetIds } from '../group/_groupHelpers.js';
import { errorMessage, infoMessage } from '../../utils/formatter.js';

// LIMITATION TELEGRAM : l'API Bot ne permet pas à un bot de "bloquer" un
// utilisateur au niveau de la plateforme (ce n'est pas une action exposée
// aux bots). L'équivalent applicatif disponible est /ban, qui empêche déjà
// la personne d'utiliser les commandes de H$Λ BOT.
export default {
  name: 'block',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: "Non disponible sur Telegram — utilisez /ban (voir description).",
  async execute(ctx) {
    const targets = getTargetIds(ctx);
    if (!targets.length) {
      await ctx.reply(errorMessage('Mentionnez ou indiquez un identifiant.'));
      return;
    }
    await ctx.reply(
      infoMessage(
        "Telegram ne permet pas à un bot de bloquer un utilisateur au niveau de la plateforme.\n" +
        `Utilisez ${ctx.prefix}ban à la place pour lui interdire l'usage de H$Λ BOT.`
      )
    );
  },
};
