import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'chat',
  aliases: [],
  category: 'ai',
  description: 'Discute librement avec l\'IA (conversation informelle).',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}chat <message>`);
      return;
    }
    const result = await chatCompletion(ctx.text, {
      system: `Tu es H$Λ BOT. Discute de façon amicale et naturelle en français avec ${ctx.pushName}.`,
    });
    await ctx.reply(result.ok ? result.text : errorMessage('Le service IA est momentanément indisponible.'));
  },
};
