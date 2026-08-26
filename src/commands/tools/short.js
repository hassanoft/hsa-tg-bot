import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'short',
  aliases: ['shorten'],
  category: 'tools',
  description: 'Raccourcit un lien. Usage : /short <lien>',
  async execute(ctx) {
    const url = ctx.args[0];
    if (!url || !url.startsWith('http')) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}short <lien complet>`);
      return;
    }
    try {
      const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('api-error');
      const short = await res.text();
      await ctx.reply(`🔗 ${short}`);
    } catch {
      await ctx.reply(errorMessage('Échec du raccourcissement du lien.'));
    }
  },
};
