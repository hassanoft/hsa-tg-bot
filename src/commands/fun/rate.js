import { randomInt } from '../../utils/helpers.js';

export default {
  name: 'rate',
  aliases: ['note'],
  category: 'fun',
  description: 'Note (aléatoirement, pour le fun) une idée ou une chose sur 10.',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}rate <quelque chose>`);
      return;
    }
    await ctx.reply(`⭐ "${ctx.text}" mérite ${randomInt(0, 10)}/10 !`);
  },
};
