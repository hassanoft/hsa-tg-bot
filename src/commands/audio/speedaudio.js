import { changeSpeed } from '../../services/audio.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'speedaudio',
  aliases: [],
  category: 'audio',
  description: "Modifie la vitesse d'un audio. Usage : /speedaudio [0.5-3]",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'audio') {
      await ctx.reply(`❌ Répondez à un audio avec ${ctx.prefix}speedaudio.`);
      return;
    }
    try {
      const out = await changeSpeed(media.buffer, 'mp3', Number(ctx.args[0]) || 1.5);
      await ctx.bot.sendMessage(ctx.chatId, { audio: out, mimetype: 'audio/mpeg' }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec du changement de vitesse.'));
    }
  },
};
