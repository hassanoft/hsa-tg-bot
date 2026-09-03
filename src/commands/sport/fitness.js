import { sendSportAdvice } from './_sportCore.js';

export default {
  name: 'fitness',
  aliases: ['musculation', 'muscu'],
  category: 'sport',
  description: 'Conseils pour progresser en musculation (à faire / à éviter).',
  async execute(ctx) {
    await sendSportAdvice(ctx, {
      title: 'Musculation',
      wikiTitle: 'Musculation',
      tips: [
        "Apprendre la technique correcte avant d'augmenter les charges",
        "S'échauffer spécifiquement sur le mouvement à venir",
        'Progresser graduellement en charge, semaine après semaine',
        'Respecter les temps de repos entre séries et entre séances',
        'Varier les groupes musculaires travaillés dans la semaine',
      ],
      mistakes: [
        'Sacrifier la forme d\'exécution pour soulever plus lourd',
        "Négliger l'échauffement avant les charges lourdes",
        "S'entraîner tous les jours sans jour de repos",
        'Ignorer une douleur articulaire (différente de la fatigue musculaire normale)',
        "Copier le programme de quelqu'un d'autre sans l'adapter à son niveau",
      ],
    });
  },
};
