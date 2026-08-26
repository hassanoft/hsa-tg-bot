import { downloadQuotedOrDirectMedia } from '../../utils/media.js';
import { errorMessage, successMessage } from '../../utils/formatter.js';

export default {
  name: 'setphoto',
  aliases: [],
  category: 'group',
  groupOnly: true,
  adminOnly: true,
  requireBotGroupAdmin: true,
  description: "Modifie la photo du groupe (répondez à une image).",
  async execute(ctx) {
    const media = await downloadQuotedOrDirectMedia(ctx.msg);
    if (!media || media.type !== 'image') {
      await ctx.reply(`❌ Répondez à une image avec ${ctx.prefix}setphoto.`);
      return;
    }
    try {
      await ctx.bot.updateProfilePicture(ctx.chatId, media.buffer);
      await ctx.reply(successMessage('Photo du groupe mise à jour.'));
    } catch {
      await ctx.reply(errorMessage('Échec de la mise à jour de la photo.'));
    }
  },
};
