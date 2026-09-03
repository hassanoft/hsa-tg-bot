import {
  checkForceJoin,
  forceJoinMessage,
} from '../../utils/forceJoin.js';

export default {
  name: 'start',
  aliases: [],
  category: 'general',
  description: 'Démarre H$Λ BOT.',

  async execute(ctx) {
    await ctx.reply(
      `🌐 VOTRE ENTREPRISE A-T-ELLE SON PROPRE SITE WEB ?

Aujourd’hui, beaucoup de clients recherchent une entreprise sur Internet avant de la contacter.

Je crée des sites web modernes, professionnels et adaptés aux téléphones pour :

🏪 Boutiques
🍔 Restaurants
💈 Coiffeurs / salons
📱 Entrepreneurs
🧑‍💻 Freelances
🏢 Petites entreprises
🎓 Associations et projets

✅ Design moderne
✅ Compatible téléphone
✅ Présentation de vos services
✅ Bouton WhatsApp
✅ Formulaire de contact
✅ Mise en ligne

💰 Création à partir de 15 000 FCFA

🔥 Offre spéciale pour mes premiers clients.

📩 Écris-moi « SITE »\n
https://wa.me/2250500525480

HSA Web Studio — Donnez une présence professionnelle à votre activité sur Internet.`
    );
  },
};