import { toVoiceNote } from '../../services/audio.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'voice',
  aliases: [],
  category: 'audio',
  description: 'Convertit un audio en note vocale Telegram (ptt).',
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || !['audio', 'video'].includes(media.type)) {
      await ctx.reply(`❌ Répondez à un audio avec ${ctx.prefix}voice.`);
      return;
    }
    try {
      const out = await toVoiceNote(media.buffer, media.type === 'video' ? 'mp4' : 'ogg');
      await ctx.bot.sendMessage(ctx.chatId, { audio: out, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la conversion en note vocale.'));
    }
  },
};
