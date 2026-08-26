import { randomChoice } from '../../utils/helpers.js';

const QUIZZES = [
  { q: "Quelle est la capitale de la Côte d'Ivoire (politique) ?", a: 'yamoussoukro' },
  { q: 'Combien de continents compte-t-on sur Terre ?', a: '7' },
  { q: "Quel est le plus long fleuve d'Afrique ?", a: 'nil' },
  { q: "Quelle planète est surnommée la planète rouge ?", a: 'mars' },
  { q: 'En quelle année a eu lieu la Coupe du Monde 1998 ?', a: '1998' },
];

export default {
  name: 'quiz',
  aliases: [],
  category: 'fun',
  description: 'Pose une question de culture générale.',
  async execute(ctx) {
    const item = randomChoice(QUIZZES);
    await ctx.reply(`🧠 Quiz :\n${item.q}\n\n💡 Répondez avec ${ctx.prefix}guess <réponse>`);
    ctx.db.setSetting(`quiz:${ctx.chatId}`, item.a);
  },
};
