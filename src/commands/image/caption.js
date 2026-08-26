import { addCaption } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'caption',
  aliases: [],
  category: 'image',
  description: 'Ajoute un texte sur une image. Usage : /caption <haut> | <bas>',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}caption <texte haut>|<texte bas>.`);
      return;
    }
    const [top = '', bottom = ''] = ctx.text.split('|').map((s) => s.trim());
    try {
      const out = await addCaption(media.buffer, { top, bottom });
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage("Échec de l'ajout du texte."));
    }
  },
};
