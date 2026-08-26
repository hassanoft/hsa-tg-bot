import { infoMessage } from '../../utils/formatter.js';

export default {
  name: 'unblock',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: "Non disponible sur Telegram — utilisez /unban (voir description).",
  async execute(ctx) {
    await ctx.reply(
      infoMessage(
        "Telegram ne permet pas à un bot de bloquer/débloquer un utilisateur au niveau de la plateforme.\n" +
        `Utilisez ${ctx.prefix}unban à la place.`
      )
    );
  },
};
