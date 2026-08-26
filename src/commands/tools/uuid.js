import crypto from 'node:crypto';

export default {
  name: 'uuid',
  aliases: [],
  category: 'tools',
  description: 'Génère un identifiant UUID v4.',
  async execute(ctx) {
    await ctx.reply(`🆔 ${crypto.randomUUID()}`);
  },
};
