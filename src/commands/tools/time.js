export default {
  name: 'time',
  aliases: ['heure'],
  category: 'tools',
  description: "Affiche l'heure actuelle (serveur du bot).",
  async execute(ctx) {
    const now = new Date();
    await ctx.reply(`🕒 Il est actuellement : ${now.toLocaleTimeString('fr-FR')} (heure du serveur)`);
  },
};
