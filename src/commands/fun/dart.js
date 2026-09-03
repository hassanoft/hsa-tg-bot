import { sendDiceGame } from './_diceCore.js';

export default {
  name: 'dart',
  aliases: ['fleche', 'darts'],
  category: 'fun',
  description: 'Lance une fléchette animée — 6 = dans le mille.',
  async execute(ctx) {
    await sendDiceGame(ctx, '🎯', (value) => `🎯 Résultat : ${value}/6${value === 6 ? ' — Dans le mille ! 🔥' : ''}`);
  },
};
