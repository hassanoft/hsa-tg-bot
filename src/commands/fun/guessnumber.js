import { randomInt } from '../../utils/helpers.js';

export default {
  name: 'guessnumber',
  aliases: ['numberguess'],
  category: 'fun',
  description: 'Devine un nombre secret. Usage : /guessnumber [max] puis /guess <nombre>',
  async execute(ctx) {
    const max = Math.min(1_000_000, Math.max(10, Number(ctx.args[0]) || 100));
    const secret = randomInt(1, max);

    ctx.db.setSetting(`guessnumber:${ctx.chatId}`, { secret, min: 1, max, attempts: 0 });

    await ctx.reply(
      `🔢 J'ai choisi un nombre secret entre 1 et ${max}.\n` +
      `💡 Devinez-le avec ${ctx.prefix}guess <nombre>`
    );
  },
};
