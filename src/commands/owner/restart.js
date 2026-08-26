export default {
  name: 'restart',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: 'Redémarre le processus H$Λ BOT.',
  async execute(ctx) {
    await ctx.reply('♻️ Redémarrage de H$Λ BOT...\n(le redémarrage automatique dépend de votre hébergeur : Render/PM2/nodemon).');
    setTimeout(() => process.exit(0), 1000);
  },
};
