export default {
  name: 'decode',
  aliases: [],
  category: 'tools',
  description: 'Décode un texte (url|hex|base64). Usage : /decode <type> <valeur>',
  async execute(ctx) {
    const [type, ...rest] = ctx.args;
    const content = rest.join(' ');
    if (!type || !content) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}decode url|hex|base64 <valeur>`);
      return;
    }
    try {
      let result;
      if (type === 'url') result = decodeURIComponent(content);
      else if (type === 'hex') result = Buffer.from(content, 'hex').toString('utf8');
      else if (type === 'base64') result = Buffer.from(content, 'base64').toString('utf8');
      else {
        await ctx.reply('❌ Type inconnu. Utilisez : url, hex ou base64.');
        return;
      }
      await ctx.reply(`🔎 ${result}`);
    } catch {
      await ctx.reply('❌ Décodage impossible : contenu invalide.');
    }
  },
};
