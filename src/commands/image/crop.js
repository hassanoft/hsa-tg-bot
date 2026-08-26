import { cropImage } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'crop',
  aliases: [],
  category: 'image',
  description: 'Recadre une image. Usage : /crop <largeur> <hauteur> [x] [y]',
  async execute(ctx) {
    const [w, h, x, y] = ctx.args.map(Number);
    if (!w || !h) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}crop <largeur> <hauteur> [x] [y]`);
      return;
    }
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}crop.`);
      return;
    }
    try {
      const out = await cropImage(media.buffer, w, h, x || 0, y || 0);
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec du recadrage (dimensions invalides ?).'));
    }
  },
};
