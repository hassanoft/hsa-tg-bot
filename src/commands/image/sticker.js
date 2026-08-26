import { handleStickerCommand } from './_stickerCore.js';

export default {
  name: 'sticker',
  aliases: [],
  category: 'image',
  description: 'Convertit une image ou une courte vidéo en sticker Telegram.',
  async execute(ctx) {
    await handleStickerCommand(ctx);
  },
};
