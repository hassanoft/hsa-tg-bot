import { config } from '../../config.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage, successMessage, infoMessage } from '../../utils/formatter.js';

// Telegram n'a pas d'équivalent au "Statut" WhatsApp accessible via l'API Bot.
// Cette commande est repositionnée : elle publie la vidéo sur un canal
// Telegram configuré (STATUS_CHANNEL_ID), dont H$Λ BOT doit être administrateur.
export default {
  name: 'videostatus',
  aliases: [],
  category: 'video',
  ownerOnly: true,
  description: "Publie une vidéo sur le canal d'annonces configuré (STATUS_CHANNEL_ID) — pas d'équivalent 'Statut' sur Telegram.",
  async execute(ctx) {
    if (!config.statusChannelId) {
      await ctx.reply(
        infoMessage(
          "Telegram n'a pas d'équivalent au Statut WhatsApp. Configurez STATUS_CHANNEL_ID " +
          '(identifiant d\'un canal dont H$Λ BOT est administrateur) dans .env pour utiliser cette commande.'
        )
      );
      return;
    }
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'video') {
      await ctx.reply(`❌ Répondez à une vidéo avec ${ctx.prefix}videostatus.`);
      return;
    }
    try {
      await ctx.bot.sendMessage(config.statusChannelId, { video: media.buffer, caption: ctx.text || '' });
      await ctx.reply(successMessage('Vidéo publiée sur le canal configuré.'));
    } catch {
      await ctx.reply(errorMessage('Échec de la publication (le bot est-il bien administrateur du canal ?).'));
    }
  },
};
