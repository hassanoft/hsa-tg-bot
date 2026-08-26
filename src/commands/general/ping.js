export default {
  name: 'ping',
  aliases: [],
  category: 'general',
  description: 'Vérifie la latence réelle du bot.',
  async execute(ctx) {
    const start = Date.now();
    const sent = await ctx.reply('🏓 Calcul en cours...');
    const latency = Date.now() - start;
    await ctx.bot.sendMessage(
      ctx.chatId,
      { text: `🏓 Pong !\n⏱️ Latence : ${latency} ms`, edit: sent.key }
    ).catch(async () => {
      await ctx.reply(`🏓 Pong !\n⏱️ Latence : ${latency} ms`);
    });
  },
};
