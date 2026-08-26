export default {
  name: 'date',
  aliases: [],
  category: 'tools',
  description: "Affiche la date actuelle (serveur du bot).",
  async execute(ctx) {
    const now = new Date();
    await ctx.reply(`📅 Nous sommes le : ${now.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
  },
};
