import { randomInt } from '../../utils/helpers.js';

export default {
  name: 'love',
  aliases: [],
  category: 'fun',
  description: "Calcule un pourcentage d'amour aléatoire et amusant.",
  async execute(ctx) {
    await ctx.reply(`❤️ Score d'amour : ${randomInt(0, 100)}%`);
  },
};
