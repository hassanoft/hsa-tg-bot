import { getLyrics } from '../../services/audio.js';
import { errorMessage } from '../../utils/formatter.js';
import { truncate } from '../../utils/helpers.js';

export default {
  name: 'lyrics',
  aliases: [],
  category: 'audio',
  description: "Cherche les paroles d'une chanson. Usage : /lyrics <artiste> - <titre>",
  async execute(ctx) {
    const [artist, title] = ctx.text.split('-').map((s) => s?.trim());
    if (!artist || !title) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}lyrics <artiste> - <titre>`);
      return;
    }
    const result = await getLyrics(artist, title);
    if (!result.ok) {
      await ctx.reply(errorMessage(result.reason === 'not-found' ? 'Paroles introuvables.' : 'Service de paroles indisponible.'));
      return;
    }
    await ctx.reply(`🎵 ${artist} - ${title}\n\n${truncate(result.lyrics, 3500)}`);
  },
};
