export default {
  name: 'football',
  aliases: [],
  category: 'sport',
  description: 'Informations et actualités sur le football.',
  async execute(ctx) {
    await ctx.reply(
      `⚽ FOOTBALL\n\n` +
      `🚧 Cette commande est actuellement en cours de développement.\n\n` +
      `⏳ Merci de patienter, elle sera bientôt disponible !`
    );
  },
};