import { db } from '../../database/database.js';
import { logger } from '../../utils/logger.js';
import { sleep } from '../../utils/helpers.js';
import { successMessage, errorMessage } from '../../utils/formatter.js';
import { config } from '../../config.js';
import { formatMention } from '../../utils/helpers.js';

const log = logger.child({ class: 'broadcast' });
let cancelRequested = false;
let isRunning = false;

export default {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'owner',
  ownerOnly: true,
  description: "Diffuse un message à tous les groupes connus. Usage : /broadcast <message> | /broadcast stop",
  async execute(ctx) {
    if (ctx.args[0] === 'stop') {
      if (!isRunning) {
        await ctx.reply('ℹ️ Aucune diffusion en cours.');
        return;
      }
      cancelRequested = true;
      await ctx.reply('🛑 Arrêt de la diffusion demandé...');
      return;
    }

    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}broadcast <message>`);
      return;
    }

    if (isRunning) {
      await ctx.reply('⚠️ Une diffusion est déjà en cours. Utilisez /broadcast stop pour l\'arrêter.');
      return;
    }

    const groupIds = db.groups.keys();
    if (!groupIds.length) {
      await ctx.reply('❌ Aucun groupe connu pour le moment.');
      return;
    }

    isRunning = true;
    cancelRequested = false;
    let sent = 0;
    let failed = 0;

    await ctx.reply(`📢 Diffusion démarrée vers ${groupIds.length} groupe(s)...`);

    for (const groupId of groupIds) {
      if (cancelRequested) break;
      try {
        await ctx.bot.sendMessage(groupId, { text: `
🚨 À VOTRE ATTENTION SVP🚨\n
--------------
 👑 Propriétaire de H$Λ BOT : ${formatMention(config.ownerId, 'HASSAN SOUGUE')} à quelques choses à vous annoncer\n
      parse_mode: 'HTML',
-------------------
${ctx.text}
-----------------
H$Λ BOT
` });

        sent += 1;
      } catch (err) {
        failed += 1;
        log.warn(`Échec de diffusion vers ${groupId}`, err.message);
      }
      await sleep(1500); // respecte les limites de débit Telegram (~30 messages/s max, marge de sécurité)
    }

    isRunning = false;
    const status = cancelRequested ? 'interrompue' : 'terminée';
    await ctx.reply(successMessage(`Diffusion ${status}. Envoyés : ${sent} | Échecs : ${failed}`));
    cancelRequested = false;
  },
};
