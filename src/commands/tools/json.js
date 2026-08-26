export default {
  name: 'json',
  aliases: [],
  category: 'tools',
  description: 'Valide et formate un JSON.',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}json <contenu JSON>`);
      return;
    }
    try {
      const parsed = JSON.parse(ctx.text);
      await ctx.reply(`✅ JSON valide :\n\`\`\`${JSON.stringify(parsed, null, 2)}\`\`\``);
    } catch (err) {
      await ctx.reply(`❌ JSON invalide : ${err.message}`);
    }
  },
};
