import { forwardTextToOwner } from '../../services/contact.js';
import { successMessage, errorMessage } from '../../utils/formatter.js';

export default {
  name: 'report',
  aliases: ['bug'],
  category: 'general',
  description: 'Signale un problème ou un bug au propriétaire du bot.',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}report <description du problème>`);
      return;
    }
    const result = await forwardTextToOwner(ctx.bot, {
      userId: ctx.senderId,
      userName: ctx.pushName,
      text: `🐞 SIGNALEMENT :\n${ctx.text}`,
    });
    await ctx.reply(
      result.ok
        ? successMessage('Votre signalement a été transmis au propriétaire.')
        : errorMessage("Le propriétaire n'est pas configuré ou n'a pas encore démarré de conversation avec le bot.")
    );
  },
};
