import crypto from 'node:crypto';

const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}',
};

export default {
  name: 'password',
  aliases: ['pass'],
  category: 'tools',
  description: 'Génère un mot de passe sécurisé. Usage : /password [longueur]',
  async execute(ctx) {
    const length = Math.min(64, Math.max(6, Number(ctx.args[0]) || 16));
    const alphabet = CHARSETS.lower + CHARSETS.upper + CHARSETS.digits + CHARSETS.symbols;
    const bytes = crypto.randomBytes(length);
    let password = '';
    for (let i = 0; i < length; i += 1) {
      password += alphabet[bytes[i] % alphabet.length];
    }
    await ctx.reply(`🔐 Mot de passe généré (${length} caractères) :\n\`\`\`${password}\`\`\``);
  },
};
