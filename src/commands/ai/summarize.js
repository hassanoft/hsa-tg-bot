import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'summarize',
  aliases: ['resume'],
  category: 'ai',
  description: 'Résume un texte long.',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}summarize <texte à résumer>`);
      return;
    }
    const result = await chatCompletion(ctx.text, { system: 'Résume le texte suivant en français, de façon claire et concise.' });
    await ctx.reply(result.ok ? result.text : errorMessage('Échec du résumé.'));
  },
};
