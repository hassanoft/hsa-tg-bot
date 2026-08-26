import { randomChoice } from '../../utils/helpers.js';

const ROASTS = [
  "T'es tellement lent que même le chargement de Telegram t'a dépassé.",
  "T'as le charisme d'un mode avion.",
  "T'es la preuve vivante que le wifi peut avoir des bugs humains.",
  "Ton niveau de fun est en mode économie d'énergie permanent.",
];

export default {
  name: 'roast',
  aliases: [],
  category: 'fun',
  description: 'Envoie une pique humoristique et bon enfant.',
  async execute(ctx) {
    await ctx.reply(`🔥 ${randomChoice(ROASTS)}`);
  },
};
