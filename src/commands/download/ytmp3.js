import { resolveViaApi, isDownloadApiConfigured } from '../../services/downloader.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'ytmp3',
  aliases: [],
  category: 'download',
  description: 'Télécharge l\'audio MP3 d\'une vidéo YouTube. Usage : /ytmp3 <lien>',
  async execute(ctx) {
    if (!isDownloadApiConfigured()) {
      await ctx.reply(errorMessage('Cette fonctionnalité nécessite DOWNLOAD_API_URL dans .env.'));
      return;
    }
    const url = ctx.args[0];
    if (!url || !url.startsWith('http')) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}ytmp3 <lien YouTube>`);
      return;
    }
    const result = await resolveViaApi('youtube-audio', url);
    if (!result.ok) {
      await ctx.reply(errorMessage('Lien invalide ou service indisponible.'));
      return;
    }
    await ctx.bot.sendMessage(
      ctx.chatId,
      { audio: { url: result.downloadUrl }, mimetype: 'audio/mpeg' },
      { quoted: ctx.msg }
    );
  },
};
