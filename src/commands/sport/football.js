import { sendSportAdvice } from './_sportCore.js';

export default {
  name: 'football',
  aliases: ['foot', 'soccer'],
  category: 'sport',
  description: 'Conseils pour progresser au football (à faire / à éviter).',
  async execute(ctx) {
    await sendSportAdvice(ctx, {
      title: 'Football',
      wikiTitle: 'Football',
      tips: [
        "S'échauffer 10-15 min avant l'effort (activation + étirements dynamiques)",
        'Travailler le pied faible régulièrement, pas seulement le pied fort',
        'Lever la tête avant de contrôler pour anticiper le jeu',
        'Soigner son placement défensif plutôt que courir après le ballon',
        "S'hydrater avant, pendant et après l'effort",
      ],
      mistakes: [
        "Négliger l'échauffement (risque de blessure musculaire)",
        'Contrôler le ballon sans avoir regardé autour au préalable',
        'Tacler à contretemps ou en retard',
        'Jouer déshydraté ou sur une douleur non soignée',
        'Négliger la récupération après le match (étirements, sommeil)',
      ],
    });
  },
};
