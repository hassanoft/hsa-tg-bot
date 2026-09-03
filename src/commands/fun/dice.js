import { sendDiceGame } from './_diceCore.js';

export default {
  name: 'dice',
  aliases: ['de'],
  category: 'fun',
  description: 'Lance un dé animé (1-6) — résultat déterminé par Telegram.',
  async execute(ctx) {
    await sendDiceGame(ctx, '🎲', (value) => `🎲 Résultat : ${value}/6`);
  },
};
