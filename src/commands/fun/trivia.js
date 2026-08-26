import { randomChoice } from '../../utils/helpers.js';

const TRIVIA = [
  "Le miel ne périme jamais s'il est correctement conservé.",
  "Les poulpes ont trois cœurs.",
  "Le Sahara était autrefois une région verte et fertile.",
  "La tour Eiffel grandit d'environ 15 cm en été à cause de la chaleur.",
  "Les abeilles peuvent reconnaître des visages humains.",
];

export default {
  name: 'trivia',
  aliases: [],
  category: 'fun',
  description: 'Affiche une anecdote insolite.',
  async execute(ctx) {
    await ctx.reply(`🧠 Le saviez-vous ? ${randomChoice(TRIVIA)}`);
  },
};
