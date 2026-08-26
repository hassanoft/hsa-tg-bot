import { toWallpaper } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'wallpaper',
  aliases: [],
  category: 'image',
  description: 'Adapte une image au format fond d\'écran mobile (1080x1920).',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}wallpaper.`);
      return;
    }
    try {
      const out = await toWallpaper(media.buffer);
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la génération du fond d\'écran.'));
    }
  },
};
