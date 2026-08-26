import Jimp from 'jimp';
import jsQR from 'jsqr';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'readqr',
  aliases: [],
  category: 'tools',
  description: 'Lit le contenu d\'un QR code présent dans une image.',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image contenant un QR code avec ${ctx.prefix}readqr.`);
      return;
    }
    try {
      const img = await Jimp.read(media.buffer);
      const { data, width, height } = img.bitmap;
      const result = jsQR(new Uint8ClampedArray(data), width, height);
      if (!result) {
        await ctx.reply('❌ Aucun QR code détecté dans cette image.');
        return;
      }
      await ctx.reply(`📷 Contenu du QR code :\n${result.data}`);
    } catch {
      await ctx.reply(errorMessage('Échec de la lecture du QR code.'));
    }
  },
};
