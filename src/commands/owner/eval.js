import util from 'node:util';

export default {
  name: 'eval',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: 'Exécute du code JavaScript (débogage OWNER uniquement — usage à vos risques).',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}eval <code JavaScript>`);
      return;
    }
    try {
      // eslint-disable-next-line no-new-func
      const asyncFn = new Function('ctx', 'db', 'bot', `return (async () => { ${ctx.text} })();`);
      const result = await asyncFn(ctx, ctx.db, ctx.bot);
      const output = typeof result === 'string' ? result : util.inspect(result, { depth: 1 });
      await ctx.reply(`✅ Résultat :\n\`\`\`${output.slice(0, 2000)}\`\`\``);
    } catch (err) {
      await ctx.reply(`❌ Erreur :\n\`\`\`${String(err?.stack || err).slice(0, 2000)}\`\`\``);
    }
  },
};
