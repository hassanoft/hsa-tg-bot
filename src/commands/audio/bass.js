import { bassBoost } from '../../services/audio.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'bass',
  aliases: [],
  category: 'audio',
  description: 'Ajoute un effet basse (bass boost). Usage : /bass [intensité 0-30]',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'audio') {
      await ctx.reply(`❌ Répondez à un audio avec ${ctx.prefix}bass.`);
      return;
    }
    try {
      const out = await bassBoost(media.buffer, 'mp3', Number(ctx.args[0]) || 15);
      await ctx.bot.sendMessage(ctx.chatId, { audio: out, mimetype: 'audio/mpeg' }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage("Échec de l'effet basse."));
    }
  },
};
