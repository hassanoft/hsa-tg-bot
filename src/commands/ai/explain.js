import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'explain',
  aliases: [],
  category: 'ai',
  description: 'Explique un concept simplement.',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}explain <sujet>`);
      return;
    }
    const result = await chatCompletion(ctx.text, { system: 'Explique ce sujet simplement et clairement, en français, avec des exemples si utile.' });
    await ctx.reply(result.ok ? result.text : errorMessage("Échec de l'explication."));
  },
};
