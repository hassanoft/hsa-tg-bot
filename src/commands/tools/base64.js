export default {
  name: 'base64',
  aliases: [],
  category: 'tools',
  description: 'Encode/décode en Base64. Usage : /base64 encode|decode <texte>',
  async execute(ctx) {
    const [mode, ...rest] = ctx.args;
    const content = rest.join(' ');
    if (!mode || !content || !['encode', 'decode'].includes(mode)) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}base64 encode|decode <texte>`);
      return;
    }
    try {
      const result =
        mode === 'encode'
          ? Buffer.from(content, 'utf8').toString('base64')
          : Buffer.from(content, 'base64').toString('utf8');
      await ctx.reply(`🔡 ${result}`);
    } catch {
      await ctx.reply('❌ Contenu Base64 invalide.');
    }
  },
};
