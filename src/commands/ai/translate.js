import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'translate',
  aliases: ['tr'],
  category: 'ai',
  description: 'Traduit un texte. Usage : /translate <langue> <texte>',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service de traduction n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    const [lang, ...rest] = ctx.args;
    if (!lang || !rest.length) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}translate <langue cible> <texte>`);
      return;
    }
    const result = await chatCompletion(rest.join(' '), {
      system: `Traduis le texte de l'utilisateur en ${lang}. Réponds uniquement avec la traduction, sans commentaire.`,
    });
    await ctx.reply(result.ok ? result.text : errorMessage('Échec de la traduction.'));
  },
};
