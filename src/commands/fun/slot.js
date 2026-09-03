import { sendDiceGame } from './_diceCore.js';

export default {
  name: 'slot',
  aliases: ['slotmachine', 'machineasous'],
  category: 'fun',
  description: 'Lance une machine à sous animée — 64 = jackpot (777).',
  async execute(ctx) {
    await sendDiceGame(ctx, '🎰', (value) => `🎰 Résultat : ${value}/64${value === 64 ? ' — JACKPOT !!! 💰' : ''}`);
  },
};
