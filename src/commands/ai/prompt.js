import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'prompt',
  aliases: [],
  category: 'ai',
  description: 'Améliore ou construit un prompt IA à partir d\'une idée.',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}prompt <idée à transformer en prompt>`);
      return;
    }
    const result = await chatCompletion(ctx.text, { system: 'Transforme cette idée en un prompt IA détaillé, clair et structuré, en français.' });
    await ctx.reply(result.ok ? result.text : errorMessage('Échec de la génération du prompt.'));
  },
};
