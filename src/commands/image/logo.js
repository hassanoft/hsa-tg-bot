import { stylize } from '../../services/image.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'logo',
  aliases: [],
  category: 'image',
  description: 'Compose un logo simple à partir d\'une image et d\'un texte.',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}logo <texte>.`);
      return;
    }
    try {
      const out = await stylize(media.buffer, { text: ctx.text });
      await ctx.bot.sendMessage(ctx.chatId, { image: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la génération du logo.'));
    }
  },
};
