import { resolveViaApi, isDownloadApiConfigured } from '../../services/downloader.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'ytmp4',
  aliases: [],
  category: 'download',
  description: 'Télécharge une vidéo YouTube en MP4. Usage : /ytmp4 <lien>',
  async execute(ctx) {
    if (!isDownloadApiConfigured()) {
      await ctx.reply(errorMessage('Cette fonctionnalité nécessite DOWNLOAD_API_URL dans .env.'));
      return;
    }
    const url = ctx.args[0];
    if (!url || !url.startsWith('http')) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}ytmp4 <lien YouTube>`);
      return;
    }
    const result = await resolveViaApi('youtube', url);
    if (!result.ok) {
      await ctx.reply(errorMessage('Lien invalide ou service indisponible.'));
      return;
    }
    await ctx.bot.sendMessage(ctx.chatId, { video: { url: result.downloadUrl } }, { quoted: ctx.msg });
  },
};
