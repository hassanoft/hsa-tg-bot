import { resolveViaApi, isDownloadApiConfigured } from '../../services/downloader.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'facebook',
  aliases: [],
  category: 'download',
  description: 'Télécharge un contenu Facebook. Usage : /facebook <lien>',
  async execute(ctx) {
    if (!isDownloadApiConfigured()) {
      await ctx.reply(errorMessage("Cette fonctionnalité nécessite DOWNLOAD_API_URL dans .env (API tierce conforme aux CGU de Facebook)."));
      return;
    }
    const url = ctx.args[0];
    if (!url || !url.startsWith('http')) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}facebook <lien Facebook>`);
      return;
    }
    const result = await resolveViaApi('facebook', url);
    if (!result.ok) {
      await ctx.reply(errorMessage('Lien invalide, contenu introuvable ou service indisponible.'));
      return;
    }
    await ctx.bot.sendMessage(
      ctx.chatId,
      { document: { url: result.downloadUrl }, mimetype: 'application/octet-stream', fileName: result.title || 'facebook-download', caption: result.title || '' },
      { quoted: ctx.msg }
    );
  },
};
