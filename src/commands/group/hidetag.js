// LIMITATION TELEGRAM : comme /tagall, ne peut notifier que les membres déjà
// vus par le bot. Les mentions sont rendues invisibles (liens texte de
// largeur nulle) pour reproduire l'effet "hidetag" de WhatsApp.
export default {
  name: 'hidetag',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  description: 'Notifie les membres connus du groupe sans afficher la liste (mentions invisibles).',
  async execute(ctx) {
    const members = ctx.db.getGroupMembers(ctx.chatId);
    if (!members.length) {
      await ctx.reply('❌ Aucun membre connu pour le moment.');
      return;
    }
    // Lien de largeur nulle (caractère invisible) vers chaque membre : notifie sans texte visible.
    const invisibleMentions = members.map((m) => `<a href="tg://user?id=${m.id}">\u200b</a>`).join('');
    await ctx.bot.sendMessage(ctx.chatId, {
      text: `${invisibleMentions}${ctx.text || '📢'}`,
      parse_mode: 'HTML',
    });
  },
};
