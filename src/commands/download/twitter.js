import { resolveViaApi, isDownloadApiConfigured } from '../../services/downloader.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'twitter',
  aliases: [],
  category: 'download',
  description: 'Télécharge un contenu Twitter/X. Usage : /twitter <lien>',
  async execute(ctx) {
    if (!isDownloadApiConfigured()) {
      await ctx.reply(errorMessage("Cette fonctionnalité nécessite DOWNLOAD_API_URL dans .env (API tierce conforme aux CGU de Twitter/X)."));
      return;
    }
    const url = ctx.args[0];
    if (!url || !url.startsWith('http')) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}twitter <lien Twitter/X>`);
      return;
    }
    const result = await resolveViaApi('twitter', url);
    if (!result.ok) {
      await ctx.reply(errorMessage('Lien invalide, contenu introuvable ou service indisponible.'));
      return;
    }
    await ctx.bot.sendMessage(
      ctx.chatId,
      { document: { url: result.downloadUrl }, mimetype: 'application/octet-stream', fileName: result.title || 'twitter-download', caption: result.title || '' },
      { quoted: ctx.msg }
    );
  },
};
