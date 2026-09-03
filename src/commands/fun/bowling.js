import { sendDiceGame } from './_diceCore.js';

export default {
  name: 'bowling',
  aliases: ['bowl'],
  category: 'fun',
  description: 'Lance une partie de bowling animée — 6 = strike.',
  async execute(ctx) {
    await sendDiceGame(ctx, '🎳', (value) => `🎳 Résultat : ${value}/6${value === 6 ? ' — Strike ! 🎉' : ''}`);
  },
};
