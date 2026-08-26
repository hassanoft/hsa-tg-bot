export default {
  name: 'groupinfo',
  aliases: [],
  category: 'group',
  groupOnly: true,
  description: 'Affiche les informations du groupe.',
  async execute(ctx) {
    const g = ctx.groupMetadata;
    if (!g) {
      await ctx.reply('❌ Impossible de récupérer les informations du groupe.');
      return;
    }
    // g.participants ne contient que les administrateurs (limitation de l'API Bot Telegram) ;
    // g.memberCount donne le vrai total de membres.
    await ctx.reply(
      `👥 ${g.subject}\n\n` +
      `🆔 ID : ${g.id}\n` +
      `📄 Description : ${g.desc || 'Aucune'}\n` +
      `👤 Membres : ${g.memberCount ?? 'inconnu'}\n` +
      `👮 Administrateurs : ${g.participants.length}`
    );
  },
};
