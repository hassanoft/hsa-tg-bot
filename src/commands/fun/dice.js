import { randomInt } from '../../utils/helpers.js';

export default {
  name: 'dice',
  aliases: ['de'],
  category: 'fun',
  description: 'Lance un dé à 6 faces.',
  async execute(ctx) {
    await ctx.reply(`🎲 Résultat : ${randomInt(1, 6)}`);
  },
};
