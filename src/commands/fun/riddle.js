import { randomChoice } from '../../utils/helpers.js';

const RIDDLES = [
  { q: "Je n'ai ni bouche ni oreilles mais je te réponds toujours. Qui suis-je ?", a: 'echo' },
  { q: "Plus je sèche, plus je deviens mouillé. Qui suis-je ?", a: 'serviette' },
  { q: "Je vole sans ailes, je pleure sans yeux. Qui suis-je ?", a: 'nuage' },
];

export default {
  name: 'riddle',
  aliases: ['devinette'],
  category: 'fun',
  description: 'Propose une devinette.',
  async execute(ctx) {
    const item = randomChoice(RIDDLES);
    await ctx.reply(`🤔 Devinette :\n${item.q}\n\n💡 Répondez avec ${ctx.prefix}guess <réponse>`);
    ctx.db.setSetting(`riddle:${ctx.chatId}`, item.a);
  },
};
