import dns from 'node:dns/promises';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'domain',
  aliases: [],
  category: 'tools',
  description: "Résout les enregistrements DNS d'un domaine. Usage : /domain <nom de domaine>",
  async execute(ctx) {
    const domain = ctx.args[0];
    if (!domain) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}domain <nom de domaine>`);
      return;
    }
    try {
      const [a, mx] = await Promise.all([
        dns.resolve4(domain).catch(() => []),
        dns.resolveMx(domain).catch(() => []),
      ]);
      if (!a.length && !mx.length) {
        await ctx.reply(errorMessage('Domaine introuvable ou sans enregistrements DNS.'));
        return;
      }
      await ctx.reply(
        `🌐 DNS pour ${domain}\n\n` +
        `📡 Adresses IPv4 : ${a.join(', ') || 'aucune'}\n` +
        `📧 Serveurs MX : ${mx.map((m) => m.exchange).join(', ') || 'aucun'}`
      );
    } catch {
      await ctx.reply(errorMessage('Résolution DNS impossible.'));
    }
  },
};
