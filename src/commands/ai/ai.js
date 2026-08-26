import { chatCompletion, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'ai',
  aliases: [],
  category: 'ai',
  description: 'Pose une question libre à l\'intelligence artificielle.',
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante dans .env)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}ai <votre question>`);
      return;
    }
    await ctx.reply('🤖 Réflexion en cours...');
    const result = await chatCompletion(ctx.text, {
      system: "Tu es H$Λ BOT, un assistant Telegram utile, concis et en français.",
    });
    await ctx.reply(result.ok ? `🤖 ${result.text}` : errorMessage("Le service IA n'a pas pu répondre pour le moment."));
  },
};
