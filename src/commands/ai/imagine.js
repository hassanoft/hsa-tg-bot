import { generateImage, isAiConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'imagine',
  aliases: [],
  category: 'ai',
  description: "Génère une image à partir d'une description.",
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("La génération d'image IA n'est pas configurée (AI_API_KEY manquante)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}imagine <description de l'image>`);
      return;
    }
    await ctx.reply('🎨 Génération en cours, veuillez patienter...');
    const result = await generateImage(ctx.text);
    if (!result.ok) {
      await ctx.reply(errorMessage("Échec de la génération d'image."));
      return;
    }
    if (result.url) {
      await ctx.bot.sendMessage(ctx.chatId, { image: { url: result.url }, caption: `🎨 ${ctx.text}` }, { quoted: ctx.msg });
    } else {
      await ctx.bot.sendMessage(ctx.chatId, { image: result.buffer, caption: `🎨 ${ctx.text}` }, { quoted: ctx.msg });
    }
  },
};
