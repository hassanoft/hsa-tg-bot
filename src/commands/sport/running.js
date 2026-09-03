import { sendSportAdvice } from './_sportCore.js';

export default {
  name: 'running',
  aliases: ['course', 'jogging'],
  category: 'sport',
  description: 'Conseils pour progresser en course à pied (à faire / à éviter).',
  async execute(ctx) {
    await sendSportAdvice(ctx, {
      title: 'Course à pied',
      wikiTitle: 'Course à pied',
      tips: [
        "Augmenter le volume hebdomadaire progressivement (règle des +10% max)",
        "S'échauffer par une marche rapide ou un trot léger avant l'effort",
        "Varier les allures : endurance fondamentale, fractionné, sorties longues",
        'Choisir des chaussures adaptées à sa foulée',
        'Intégrer du renforcement musculaire (gainage, jambes) en complément',
      ],
      mistakes: [
        "Augmenter trop vite la distance ou l'intensité",
        'Ignorer une douleur qui persiste plusieurs sorties',
        'Courir systématiquement à la même allure',
        'Négliger la récupération entre les séances intenses',
        "Sauter les repas ou mal s'hydrater avant une sortie longue",
      ],
    });
  },
};
