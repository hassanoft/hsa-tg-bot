import { resolveViaApi, isDownloadApiConfigured } from '../../services/downloader.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'play',
  aliases: [],
  category: 'audio',
  description: "Recherche et envoie une musique. Usage : /play <titre>",
  async execute(ctx) {
    if (!isDownloadApiConfigured()) {
      await ctx.reply(errorMessage("Cette fonctionnalité nécessite DOWNLOAD_API_URL dans .env (API tierce conforme aux CGU)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}play <titre de la musique>`);
      return;
    }
    const result = await resolveViaApi('search-audio', ctx.text);
    if (!result.ok) {
      await ctx.reply(errorMessage('Aucun résultat trouvé ou service indisponible.'));
      return;
    }
    await ctx.bot.sendMessage(ctx.chatId, { audio: { url: result.downloadUrl }, mimetype: 'audio/mpeg' }, { quoted: ctx.msg });
  },
};
