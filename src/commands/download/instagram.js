import { resolveViaApi, isDownloadApiConfigured } from '../../services/downloader.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'instagram',
  aliases: [],
  category: 'download',
  description: 'Télécharge un contenu Instagram. Usage : /instagram <lien>',
  async execute(ctx) {
    if (!isDownloadApiConfigured()) {
      await ctx.reply(errorMessage("Cette fonctionnalité nécessite DOWNLOAD_API_URL dans .env (API tierce conforme aux CGU de Instagram)."));
      return;
    }
    const url = ctx.args[0];
    if (!url || !url.startsWith('http')) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}instagram <lien Instagram>`);
      return;
    }
    const result = await resolveViaApi('instagram', url);
    if (!result.ok) {
      await ctx.reply(errorMessage('Lien invalide, contenu introuvable ou service indisponible.'));
      return;
    }
    await ctx.bot.sendMessage(
      ctx.chatId,
      { document: { url: result.downloadUrl }, mimetype: 'application/octet-stream', fileName: result.title || 'instagram-download', caption: result.title || '' },
      { quoted: ctx.msg }
    );
  },
};
