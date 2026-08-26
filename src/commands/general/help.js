import { sendMenu } from '../../utils/menuBuilder.js';

export default {
  name: 'help',
  aliases: [],
  category: 'general',
  description: 'Affiche le menu complet des commandes, ou une catégorie précise.',
  async execute(ctx) {
    await sendMenu(ctx, ctx.args[0]);
  },
};
