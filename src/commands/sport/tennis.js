import { sendSportAdvice } from './_sportCore.js';

export default {
  name: 'tennis',
  aliases: [],
  category: 'sport',
  description: 'Conseils pour progresser au tennis (à faire / à éviter).',
  async execute(ctx) {
    await sendSportAdvice(ctx, {
      title: 'Tennis',
      wikiTitle: 'Tennis',
      tips: [
        'Préparer la raquette tôt, dès que la trajectoire adverse est lisible',
        'Transférer le poids du corps vers l\'avant au moment de la frappe',
        'Varier les effets (lift, slice) pour perturber le rythme adverse',
        'Revenir au centre du court après chaque échange',
        'Fléchir les jambes plutôt que de frapper uniquement avec le bras',
      ],
      mistakes: [
        'Regarder la balle trop tard ou la quitter des yeux avant l\'impact',
        'Crisper le poignet et le bras pendant la frappe',
        'Rester statique juste après le service',
        'Négliger le jeu de jambes (déplacement, équilibre)',
        "Changer de technique en plein match sous le coup de la frustration",
      ],
    });
  },
};
