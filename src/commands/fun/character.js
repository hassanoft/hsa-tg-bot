import { randomChoice } from '../../utils/helpers.js';

const TRAITS = ['courageux', 'mystérieux', 'joyeux', 'sage', 'rusé', 'loyal', 'rêveur', 'discipliné'];
const ROLES = ['guerrier', 'inventeur', 'explorateur', 'artiste', 'stratège', 'guérisseur'];

export default {
  name: 'character',
  aliases: ['perso'],
  category: 'fun',
  description: 'Génère un personnage aléatoire pour un jeu de rôle.',
  async execute(ctx) {
    await ctx.reply(`🎭 Personnage généré : un(e) ${randomChoice(ROLES)} ${randomChoice(TRAITS)}.`);
  },
};
