import { toMp3 } from '../../services/audio.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'tomp3',
  aliases: [],
  category: 'audio',
  description: 'Convertit une note vocale ou un audio en MP3.',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'audio') {
      await ctx.reply(`❌ Répondez à un audio/note vocale avec ${ctx.prefix}tomp3.`);
      return;
    }
    try {
      const out = await toMp3(media.buffer, 'ogg');
      await ctx.bot.sendMessage(ctx.chatId, { audio: out, mimetype: 'audio/mpeg' }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la conversion en MP3.'));
    }
  },
};
