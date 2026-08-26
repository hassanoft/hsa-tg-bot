export default {
  name: 'shutdown',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: 'Arrête complètement le processus H$Λ BOT.',
  async execute(ctx) {
    await ctx.reply('🛑 Arrêt de H$Λ BOT...');
    setTimeout(() => process.exit(0), 1000);
  },
};
