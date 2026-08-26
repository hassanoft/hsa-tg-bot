import { config } from '../../config.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'currency',
  aliases: ['devise'],
  category: 'tools',
  description: 'Convertit une devise. Usage : /currency <montant> <de> <vers> (ex: 100 USD EUR)',
  async execute(ctx) {
    const [amountRaw, from, to] = ctx.args;
    const amount = Number(amountRaw);
    if (!amount || !from || !to) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}currency <montant> <devise source> <devise cible> (ex: 100 USD XOF)`);
      return;
    }
    try {
      const url = new URL(config.currency.apiUrl);
      url.searchParams.set('base', from.toUpperCase());
      url.searchParams.set('symbols', to.toUpperCase());
      const res = await fetch(url);
      if (!res.ok) throw new Error('api-error');
      const data = await res.json();
      const rate = data.rates?.[to.toUpperCase()];
      if (!rate) throw new Error('rate-not-found');
      await ctx.reply(`💱 ${amount} ${from.toUpperCase()} = ${(amount * rate).toFixed(2)} ${to.toUpperCase()}`);
    } catch {
      await ctx.reply(errorMessage('Conversion impossible (devise inconnue ou service indisponible).'));
    }
  },
};
