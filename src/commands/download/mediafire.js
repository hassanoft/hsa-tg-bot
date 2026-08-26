import { resolveMediafire } from '../../services/downloader.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'mediafire',
  aliases: [],
  category: 'download',
  description: 'Résout le lien de téléchargement direct MediaFire. Usage : /mediafire <lien>',
  async execute(ctx) {
    const url = ctx.args[0];
    if (!url || !url.includes('mediafire.com')) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}mediafire <lien MediaFire>`);
      return;
    }
    const result = await resolveMediafire(url);
    if (!result.ok) {
      await ctx.reply(errorMessage('Lien de téléchargement introuvable sur cette page.'));
      return;
    }
    await ctx.bot.sendMessage(
      ctx.chatId,
      { document: { url: result.downloadUrl }, mimetype: 'application/octet-stream', fileName: 'fichier-mediafire' },
      { quoted: ctx.msg }
    );
  },
};
