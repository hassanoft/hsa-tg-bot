import { randomChoice } from '../../utils/helpers.js';

const ANSWERS = [
  "Oui, absolument.", "C'est certain.", "Sans aucun doute.", "Oui, tu peux compter dessus.",
  "Probablement.", "Les signes penchent pour oui.", "Réponse floue, retente ta chance.",
  "Redemande plus tard.", "Mieux vaut ne pas te le dire maintenant.",
  "Je ne peux pas prédire ça pour le moment.", "N'y compte pas.", "Ma réponse est non.",
  "Mes sources disent non.", "Les perspectives ne sont pas bonnes.", "Très douteux.",
];

export default {
  name: '8ball',
  aliases: ['boule8'],
  category: 'fun',
  description: 'Pose une question à la boule magique. Usage : /8ball <question>',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}8ball <question>`);
      return;
    }
    await ctx.reply(`🎱 ${randomChoice(ANSWERS)}`);
  },
};
