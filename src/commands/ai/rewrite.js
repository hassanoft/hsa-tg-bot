import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'rewrite',
  aliases: ['reformuler'],
  category: 'ai',
  description: 'Reformule un texte.',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}rewrite <texte>`);
      return;
    }
    const result = await chatCompletion(ctx.text, { system: 'Reformule le texte suivant en français avec un style différent, en gardant le même sens.' });
    await ctx.reply(result.ok ? result.text : errorMessage('Échec de la reformulation.'));
  },
};
