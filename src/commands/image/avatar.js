import { stylize } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'avatar',
  aliases: [],
  category: 'image',
  description: 'Transforme une photo en avatar circulaire 512x512.',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}avatar.`);
      return;
    }
    try {
      const out = await stylize(media.buffer, { circle: true });
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage("Échec de la génération de l'avatar."));
    }
  },
};
