import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'debug',
  aliases: [],
  category: 'ai',
  description: 'Analyse un extrait de code ou un message d\'erreur.',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}debug <code ou message d'erreur>`);
      return;
    }
    const result = await chatCompletion(ctx.text, { system: "Identifie le problème dans ce code/erreur et propose une correction claire." });
    await ctx.reply(result.ok ? result.text : errorMessage('Échec de l\'analyse.'));
  },
};
