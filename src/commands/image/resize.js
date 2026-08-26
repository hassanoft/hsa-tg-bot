import { resizeImage } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'resize',
  aliases: [],
  category: 'image',
  description: 'Redimensionne une image. Usage : /resize <largeur> <hauteur>',
  async execute(ctx) {
    const [w, h] = ctx.args.map(Number);
    if (!w || !h) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}resize <largeur> <hauteur>`);
      return;
    }
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}resize.`);
      return;
    }
    try {
      const out = await resizeImage(media.buffer, w, h);
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec du redimensionnement.'));
    }
  },
};
