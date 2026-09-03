import { sendSportAdvice } from './_sportCore.js';

export default {
  name: 'basketball',
  aliases: ['basket'],
  category: 'sport',
  description: 'Conseils pour progresser au basketball (à faire / à éviter).',
  async execute(ctx) {
    await sendSportAdvice(ctx, {
      title: 'Basketball',
      wikiTitle: 'Basket-ball',
      tips: [
        'Travailler le tir des deux mains, pas seulement la main forte',
        'Garder les genoux fléchis et le centre de gravité bas en défense',
        "Communiquer verbalement avec les coéquipiers en permanence",
        "Travailler l'explosivité (pliométrie, gainage) hors du terrain",
        'Répéter les gestes techniques (dribble, tir) à faible intensité avant de monter en rythme',
      ],
      mistakes: [
        'Baisser les yeux vers le ballon en dribblant',
        "Tirer sans être équilibré ou en pleine course sans contrôle",
        "Négliger la défense pour ne se concentrer que sur l'attaque",
        'Sauter au shoot sans plan, au risque de provoquer une faute',
        "Ignorer l'échauffement des chevilles (articulation la plus exposée)",
      ],
    });
  },
};
