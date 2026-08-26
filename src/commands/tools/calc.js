import { safeEvaluate } from '../../utils/mathEval.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'calc',
  aliases: ['calculer'],
  category: 'tools',
  description: 'Calculatrice sécurisée (ne repose jamais sur eval()). Usage : /calc 2+2*5',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}calc <expression> (ex: 2+2*5)`);
      return;
    }
    try {
      const result = safeEvaluate(ctx.text);
      await ctx.reply(`🧮 ${ctx.text} = ${result}`);
    } catch (err) {
      await ctx.reply(errorMessage(`Expression invalide : ${err.message}`));
    }
  },
};
