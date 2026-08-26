import QRCode from 'qrcode';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'qr',
  aliases: [],
  category: 'tools',
  description: 'Génère un QR code à partir d\'un texte. Usage : /qr <texte>',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}qr <texte ou lien>`);
      return;
    }
    try {
      const buffer = await QRCode.toBuffer(ctx.text, { width: 512, margin: 2 });
      await ctx.bot.sendMessage(ctx.chatId, { image: buffer, caption: `📷 QR Code généré` }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la génération du QR code.'));
    }
  },
};
