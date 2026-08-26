import { errorMessage, infoMessage } from '../../utils/formatter.js';

// LIMITATION TELEGRAM : un bot ne peut PAS ajouter un utilisateur à un groupe
// (restriction de confidentialité de la plateforme — seul un humain membre
// du groupe, ou l'utilisateur lui-même via un lien d'invitation, peut le
// faire). Cette commande propose donc la meilleure alternative réelle :
// générer le lien d'invitation à transmettre à la personne concernée.
export default {
  name: 'add',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: "Génère un lien d'invitation (Telegram ne permet pas à un bot d'ajouter directement un membre).",
  async execute(ctx) {
    try {
      const link = await ctx.bot.groupInviteCode(ctx.chatId);
      await ctx.reply(
        infoMessage(
          "Telegram ne permet pas à un bot d'ajouter directement un membre à un groupe.\n\n" +
          `Partagez ce lien d'invitation à la place :\n${link}`
        )
      );
    } catch {
      await ctx.reply(errorMessage("Impossible de générer le lien d'invitation (le bot doit être admin)."));
    }
  },
};
