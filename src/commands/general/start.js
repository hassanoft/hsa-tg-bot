import {
  checkForceJoin,
  forceJoinMessage,
} from '../../utils/forceJoin.js';

export default {
  name: 'start',
  aliases: [],
  category: 'general',
  description: 'Démarre H$Λ BOT.',

  async execute(ctx) {
    const subscription = await checkForceJoin(
      ctx.bot,
      ctx.senderId
    );

    if (!subscription.joined) {
      await ctx.reply(forceJoinMessage());
      return;
    }

    await ctx.reply(
      `👋 Bienvenue ${ctx.pushName} !\n\n` +
      `✅ Accès autorisé.\n\n` +
      `Utilise ${ctx.prefix}help pour afficher les commandes.`
    );
  },
};