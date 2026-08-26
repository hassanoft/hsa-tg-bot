import { handleStickerCommand } from './_stickerCore.js';

export default {
  name: 's',
  aliases: [],
  category: 'image',
  description: 'Alias rapide de /sticker.',
  async execute(ctx) {
    await handleStickerCommand(ctx);
  },
};
