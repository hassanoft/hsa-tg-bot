import { trimVideo } from '../../services/video.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'trim',
  aliases: [],
  category: 'video',
  description: 'Découpe une vidéo. Usage : /trim <début_s> <durée_s>',
  async execute(ctx) {
    const [start, duration] = ctx.args.map(Number);
    if (Number.isNaN(start) || Number.isNaN(duration)) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}trim <début en secondes> <durée en secondes>`);
      return;
    }
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'video') {
      await ctx.reply(`❌ Répondez à une vidéo avec ${ctx.prefix}trim.`);
      return;
    }
    try {
      const out = await trimVideo(media.buffer, 'mp4', start, duration);
      await ctx.bot.sendMessage(ctx.chatId, { video: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec du découpage.'));
    }
  },
};
