export default {
  name: 'guess',
  aliases: [],
  category: 'fun',
  description: 'Répond à un /quiz ou /riddle en cours.',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}guess <votre réponse>`);
      return;
    }
    const quizAnswer = ctx.db.getSetting(`quiz:${ctx.chatId}`);
    const riddleAnswer = ctx.db.getSetting(`riddle:${ctx.chatId}`);
    const expected = quizAnswer || riddleAnswer;

    if (!expected) {
      await ctx.reply('ℹ️ Aucun quiz/devinette en cours. Lancez /quiz ou /riddle.');
      return;
    }

    const correct = ctx.text.trim().toLowerCase().includes(String(expected).toLowerCase());
    await ctx.reply(correct ? '✅ Bonne réponse !' : `❌ Mauvaise réponse. La bonne réponse était : ${expected}`);
    ctx.db.setSetting(`quiz:${ctx.chatId}`, undefined);
    ctx.db.setSetting(`riddle:${ctx.chatId}`, undefined);
  },
};
