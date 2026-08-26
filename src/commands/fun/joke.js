import { randomChoice } from '../../utils/helpers.js';

const JOKES = [
  "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau.",
  "Qu'est-ce qu'un crocodile qui surveille une pharmacie ? Un investigator.",
  "Pourquoi les poissons détestent-ils l'ordinateur ? Ils ont peur du net.",
  "Que dit un ordinateur quand il a froid ? Il a des win-gel.",
];

export default {
  name: 'joke',
  aliases: ['blague'],
  category: 'fun',
  description: 'Raconte une blague.',
  async execute(ctx) {
    await ctx.reply(`😂 ${randomChoice(JOKES)}`);
  },
};
