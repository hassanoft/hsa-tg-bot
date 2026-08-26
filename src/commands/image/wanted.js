import { wantedPoster } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'wanted',
  aliases: [],
  category: 'image',
  description: "Génère un avis de recherche façon 'WANTED' à partir d'une photo.",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}wanted [nom].`);
      return;
    }
    try {
      const out = await wantedPoster(media.buffer, ctx.text);
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage("Échec de la génération de l'avis de recherche."));
    }
  },
};
