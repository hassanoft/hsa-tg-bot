import { addCaption } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

// Cette commande est intentionnellement listée à la fois dans IMAGE et FUN
// dans le menu (cahier des charges) : il s'agit d'une seule et même commande.
export default {
  name: 'meme',
  aliases: [],
  category: 'image',
  description: 'Crée un mème classique (texte haut/bas) à partir d\'une image.',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}meme <texte haut>|<texte bas>.`);
      return;
    }
    const [top = '', bottom = ''] = (ctx.text || '').split('|').map((s) => s.trim());
    try {
      const out = await addCaption(media.buffer, { top, bottom });
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la création du mème.'));
    }
  },
};
