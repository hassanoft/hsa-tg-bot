import { resolveGoogleDrive } from '../../services/downloader.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'gdrive',
  aliases: [],
  category: 'download',
  description: 'Construit le lien de téléchargement direct Google Drive. Usage : /gdrive <lien>',
  async execute(ctx) {
    const url = ctx.args[0];
    if (!url || !url.includes('drive.google.com')) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}gdrive <lien Google Drive>`);
      return;
    }
    const result = resolveGoogleDrive(url);
    if (!result.ok) {
      await ctx.reply(errorMessage('Lien Google Drive invalide.'));
      return;
    }
    await ctx.reply(`📎 Lien direct :\n${result.downloadUrl}\n\n⚠️ Les fichiers volumineux peuvent nécessiter une confirmation manuelle sur Google Drive.`);
  },
};
