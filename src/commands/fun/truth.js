import { randomChoice } from '../../utils/helpers.js';

const TRUTHS = [
  "Quel est ton plus grand rêve inavoué ?",
  "Quelle est la chose la plus gênante qui te soit arrivée ?",
  "Quel est ton plus gros mensonge dit à un proche ?",
  "Quelle est ta plus grande peur ?",
];

export default {
  name: 'truth',
  aliases: [],
  category: 'fun',
  description: "Propose une question 'vérité' (action ou vérité).",
  async execute(ctx) {
    await ctx.reply(`🫣 Vérité : ${randomChoice(TRUTHS)}`);
  },
};
