import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'ask',
  aliases: [],
  category: 'ai',
  description: 'Pose une question factuelle à l\'IA.',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}ask <question>`);
      return;
    }
    const result = await chatCompletion(ctx.text, { system: 'Réponds de façon factuelle et concise, en français.' });
    await ctx.reply(result.ok ? result.text : errorMessage('Impossible d\'obtenir une réponse pour le moment.'));
  },
};
