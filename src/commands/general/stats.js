import { db } from '../../database/database.js';
import { formatDuration, formatBytes } from '../../utils/formatter.js';
import { getUptimeMs } from '../../utils/uptime.js';

export default {
  name: 'stats',
  aliases: [],
  category: 'general',
  description: 'Statistiques globales du bot.',
  async execute(ctx) {
    await ctx.reply(
      `📊 Statistiques H$Λ BOT\n\n` +
      `👤 Utilisateurs connus : ${db.users.count()}\n` +
      `👥 Groupes connus : ${db.groups.count()}\n` +
      `⚙️ Commandes exécutées : ${db.getStat('commandsExecuted')}\n` +
      `❌ Erreurs enregistrées : ${db.getStat('errors')}\n` +
      `⏱️ En ligne depuis : ${formatDuration(getUptimeMs())}\n` +
      `💾 Mémoire utilisée : ${formatBytes(process.memoryUsage().rss)}`
    );
  },
};
