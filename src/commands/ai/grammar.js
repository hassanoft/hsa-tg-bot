import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'grammar',
  aliases: ['correct'],
  category: 'ai',
  description: 'Corrige la grammaire et l\'orthographe d\'un texte.',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}grammar <texte>`);
      return;
    }
    const result = await chatCompletion(ctx.text, { system: "Corrige uniquement l'orthographe et la grammaire du texte suivant, sans changer le style. Réponds uniquement avec le texte corrigé." });
    await ctx.reply(result.ok ? result.text : errorMessage('Échec de la correction.'));
  },
};
