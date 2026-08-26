import { resolveViaApi, isDownloadApiConfigured } from '../../services/downloader.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'yt',
  aliases: [],
  category: 'download',
  description: 'Télécharge un contenu YouTube. Usage : /yt <lien>',
  async execute(ctx) {
    if (!isDownloadApiConfigured()) {
      await ctx.reply(errorMessage("Cette fonctionnalité nécessite DOWNLOAD_API_URL dans .env (API tierce conforme aux CGU de YouTube)."));
      return;
    }
    const url = ctx.args[0];
    if (!url || !url.startsWith('http')) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}yt <lien YouTube>`);
      return;
    }
    const result = await resolveViaApi('youtube', url);
    if (!result.ok) {
      await ctx.reply(errorMessage('Lien invalide, contenu introuvable ou service indisponible.'));
      return;
    }
    await ctx.bot.sendMessage(
      ctx.chatId,
      { document: { url: result.downloadUrl }, mimetype: 'application/octet-stream', fileName: result.title || 'yt-download', caption: result.title || '' },
      { quoted: ctx.msg }
    );
  },
};
