export default {
  name: 'basketball',
  aliases: [],
  category: 'sport',
  description: 'Informations et actualités sur le basketball.',
  async execute(ctx) {
    await ctx.reply(
      `🏀 BASKETBALL\n\n` +
      `🚧 Cette commande est actuellement en cours de développement.\n\n` +
      `⏳ Merci de patienter, elle sera bientôt disponible !`
    );
  },
};