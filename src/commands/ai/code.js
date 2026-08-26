import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'code',
  aliases: [],
  category: 'ai',
  description: 'Génère du code à partir d\'une description.',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}code <description du code souhaité>`);
      return;
    }
    const result = await chatCompletion(ctx.text, { system: 'Tu es un développeur senior. Réponds avec du code propre et fonctionnel, commenté brièvement.' });
    await ctx.reply(result.ok ? result.text : errorMessage('Échec de la génération de code.'));
  },
};
