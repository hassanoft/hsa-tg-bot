import { randomChoice } from '../../utils/helpers.js';

const DARES = [
  "Envoie un vocal en chantant ta chanson préférée.",
  "Change ta photo de profil pendant 1 heure par une photo drôle.",
  "Écris un message en verlan.",
  "Envoie le dernier emoji que tu as utilisé sans explication.",
];

export default {
  name: 'dare',
  aliases: [],
  category: 'fun',
  description: "Propose un défi (action ou vérité).",
  async execute(ctx) {
    await ctx.reply(`😈 Action : ${randomChoice(DARES)}`);
  },
};
