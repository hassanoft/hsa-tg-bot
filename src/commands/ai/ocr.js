import { createWorker } from 'tesseract.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'ocr',
  aliases: [],
  category: 'ai',
  description: "Extrait le texte contenu dans une image (100% local, sans clé API).",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}ocr.`);
      return;
    }
    await ctx.reply('🔎 Lecture du texte en cours...');
    const worker = await createWorker(['eng', 'fra']);
    try {
      const { data } = await worker.recognize(media.buffer);
      const extracted = (data.text || '').trim();
      await ctx.reply(extracted ? `📝 Texte détecté :\n\n${extracted}` : '❌ Aucun texte détecté dans cette image.');
    } catch (err) {
      await ctx.reply(errorMessage("Échec de la reconnaissance de texte."));
    } finally {
      await worker.terminate();
    }
  },
};
