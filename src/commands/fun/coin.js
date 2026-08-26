import { randomChoice } from '../../utils/helpers.js';

export default {
  name: 'coin',
  aliases: ['pile'],
  category: 'fun',
  description: 'Lance une pièce (pile ou face).',
  async execute(ctx) {
    await ctx.reply(`🪙 ${randomChoice(['Pile', 'Face'])} !`);
  },
};
