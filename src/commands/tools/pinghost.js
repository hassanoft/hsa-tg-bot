import dns from 'node:dns/promises';
import net from 'node:net';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'pinghost',
  aliases: [],
  category: 'tools',
  description: "Teste la joignabilité d'un hôte (résolution DNS + connexion TCP:443). Usage : /pinghost <hôte>",
  async execute(ctx) {
    const host = ctx.args[0];
    if (!host) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}pinghost <domaine ou IP>`);
      return;
    }
    try {
      const start = Date.now();
      const { address } = await dns.lookup(host);
      const dnsMs = Date.now() - start;

      const tcpStart = Date.now();
      await new Promise((resolve, reject) => {
        const socket = net.createConnection({ host: address, port: 443, timeout: 5000 });
        socket.on('connect', () => { socket.destroy(); resolve(); });
        socket.on('timeout', () => { socket.destroy(); reject(new Error('timeout')); });
        socket.on('error', reject);
      });
      const tcpMs = Date.now() - tcpStart;

      await ctx.reply(
        `📶 ${host} est joignable\n\n` +
        `📡 IP résolue : ${address}\n` +
        `⏱️ Résolution DNS : ${dnsMs} ms\n` +
        `🔌 Connexion TCP:443 : ${tcpMs} ms`
      );
    } catch {
      await ctx.reply(errorMessage(`${host} est injoignable ou ne répond pas sur le port 443.`));
    }
  },
};
