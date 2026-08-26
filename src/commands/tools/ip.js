import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'ip',
  aliases: [],
  category: 'tools',
  description: 'Donne des informations publiques sur une adresse IP. Usage : /ip <adresse>',
  async execute(ctx) {
    const ip = ctx.args[0];
    if (!ip) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}ip <adresse IP>`);
      return;
    }
    try {
      const res = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}?lang=fr`);
      const data = await res.json();
      if (data.status !== 'success') {
        await ctx.reply(errorMessage("Adresse IP invalide ou introuvable."));
        return;
      }
      await ctx.reply(
        `🌐 Informations IP : ${ip}\n\n` +
        `📍 Pays : ${data.country}\n` +
        `🏙️ Ville : ${data.city}\n` +
        `🏢 FAI : ${data.isp}\n` +
        `🗺️ Fuseau horaire : ${data.timezone}`
      );
    } catch {
      await ctx.reply(errorMessage('Service de géolocalisation IP indisponible.'));
    }
  },
};
