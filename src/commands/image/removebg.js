import { removeBackground, isRemoveBgConfigured } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'removebg',
  aliases: [],
  category: 'image',
  description: "Supprime l'arrière-plan d'une image (nécessite REMOVEBG_API_KEY).",
  async execute(ctx) {
    if (!isRemoveBgConfigured()) {
      await ctx.reply(errorMessage("Cette fonctionnalité nécessite une clé REMOVEBG_API_KEY dans .env."));
      return;
    }
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}removebg.`);
      return;
    }
    await ctx.reply('✂️ Suppression du fond en cours...');
    const result = await removeBackground(media.buffer);
    if (!result.ok) {
      await ctx.reply(errorMessage('Échec de la suppression du fond.'));
      return;
    }
    await ctx.bot.sendMessage(ctx.chatId, { image: result.buffer }, { quoted: ctx.msg });
  },
};
