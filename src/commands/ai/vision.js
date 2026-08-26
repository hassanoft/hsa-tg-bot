import { visionCompletion, isAiConfigured } from '../../services/ai.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'vision',
  aliases: [],
  category: 'ai',
  description: "Analyse et décrit une image (répondez à une image avec /vision).",
  async execute(ctx) {
    if (!isAiConfigured()) {
      await ctx.reply(errorMessage("Le service IA n'est pas configuré (AI_API_KEY manquante)."));
      return;
    }
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}vision <question optionnelle>.`);
      return;
    }
    const result = await visionCompletion(ctx.text, media.buffer.toString('base64'), media.mimetype);
    await ctx.reply(result.ok ? `👁️ ${result.text}` : errorMessage("Impossible d'analyser l'image."));
  },
};
