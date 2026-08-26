export default {
  name: 'speed',
  aliases: [],
  category: 'general',
  description: "Mesure le temps de traitement d'une commande par le bot.",
  async execute(ctx) {
    const t0 = process.hrtime.bigint();
    const t1 = process.hrtime.bigint();
    const processingMs = Number(t1 - t0) / 1_000_000;
    const networkMs = Math.max(0, Date.now() - Number(ctx.msg.date) * 1000);
    await ctx.reply(
      `⚡ Vitesse H$Λ BOT\n\n` +
      `🧠 Traitement interne : ${processingMs.toFixed(2)} ms\n` +
      `🌐 Latence réseau (Telegram → bot) : ${networkMs} ms`
    );
  },
};
