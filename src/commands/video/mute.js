import { muteVideo } from '../../services/video.js';
import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'mute',
  aliases: [],
  category: 'video',
  description: "Retire la piste audio d'une vidéo.",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'video') {
      await ctx.reply(`❌ Répondez à une vidéo avec ${ctx.prefix}mute.`);
      return;
    }
    try {
      const out = await muteVideo(media.buffer);
      await ctx.bot.sendMessage(ctx.chatId, { video: out }, { quoted: ctx.msg });
    } catch {
      await ctx.reply(errorMessage('Échec de la suppression du son.'));
    }
  },
};
