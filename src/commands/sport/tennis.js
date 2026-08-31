export default {
  name: 'tennis',
  aliases: [],
  category: 'sport',
  description: 'Informations et actualités sur le tennis.',
  async execute(ctx) {
    await ctx.reply(
      `🎾 TENNIS\n\n` +
      `🚧 Cette commande est actuellement en cours de développement.\n\n` +
      `⏳ Merci de patienter, elle sera bientôt disponible !`
    );
  },
};