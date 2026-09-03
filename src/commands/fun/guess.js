export default {
  name: 'guess',
  aliases: [],
  category: 'fun',
  description: 'Répond à un /quiz, /riddle ou /guessnumber en cours.',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}guess <votre réponse>`);
      return;
    }

    // --- Partie /guessnumber en cours ? (prioritaire, logique numérique dédiée) ---
    const game = ctx.db.getSetting(`guessnumber:${ctx.chatId}`);
    if (game && typeof game === 'object') {
      const guess = Number(ctx.text.trim());
      if (Number.isNaN(guess)) {
        await ctx.reply(`❌ Entrez un nombre entre ${game.min} et ${game.max}.`);
        return;
      }

      game.attempts += 1;

      if (guess === game.secret) {
        ctx.db.setSetting(`guessnumber:${ctx.chatId}`, undefined);
        await ctx.reply(`🎉 Gagné ! Le nombre était bien ${game.secret}, trouvé en ${game.attempts} essai(s).`);
        return;
      }

      if (guess < game.secret) {
        game.min = Math.max(game.min, guess + 1);
        ctx.db.setSetting(`guessnumber:${ctx.chatId}`, game);
        await ctx.reply(`📈 Plus grand ! (entre ${game.min} et ${game.max})`);
        return;
      }

      game.max = Math.min(game.max, guess - 1);
      ctx.db.setSetting(`guessnumber:${ctx.chatId}`, game);
      await ctx.reply(`📉 Plus petit ! (entre ${game.min} et ${game.max})`);
      return;
    }

    // --- Sinon, /quiz ou /riddle classique (comparaison textuelle) ---
    const quizAnswer = ctx.db.getSetting(`quiz:${ctx.chatId}`);
    const riddleAnswer = ctx.db.getSetting(`riddle:${ctx.chatId}`);
    const expected = quizAnswer || riddleAnswer;

    if (!expected) {
      await ctx.reply('ℹ️ Aucun quiz/devinette/partie en cours. Lancez /quiz, /riddle ou /guessnumber.');
      return;
    }

    const correct = ctx.text.trim().toLowerCase().includes(String(expected).toLowerCase());
    await ctx.reply(correct ? '✅ Bonne réponse !' : `❌ Mauvaise réponse. La bonne réponse était : ${expected}`);
    ctx.db.setSetting(`quiz:${ctx.chatId}`, undefined);
    ctx.db.setSetting(`riddle:${ctx.chatId}`, undefined);
  },
};
