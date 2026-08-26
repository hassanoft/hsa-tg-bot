import { sendMenu } from '../../utils/menuBuilder.js';

export default {
  name: 'menu',
  aliases: [],
  category: 'general',
  description: 'Alias de /help : affiche exactement le même menu.',
  async execute(ctx) {
    await sendMenu(ctx, ctx.args[0]);
  },
};
