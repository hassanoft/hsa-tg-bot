import { rotateImage } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'rotate',
  aliases: [],
  category: 'image',
  description: "Fait pivoter une image. Usage : /rotate <degrés>",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}rotate <degrés>.`);
      return;
    }
    try {
      const out = await rotateImage(media.buffer, ctx.args[0]);
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la rotation.'));
    }
  },
};
