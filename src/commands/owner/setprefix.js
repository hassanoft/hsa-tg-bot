import { setPrefix } from '../../utils/prefixStore.js';
import { successMessage, errorMessage } from '../../utils/formatter.js';

export default {
  name: 'setprefix',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: 'Change le préfixe des commandes. Usage : /setprefix !',
  async execute(ctx) {
    const newPrefix = ctx.args[0];
    if (!newPrefix) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}setprefix <nouveau préfixe>`);
      return;
    }
    try {
      setPrefix(newPrefix);
      await ctx.reply(successMessage(`Préfixe mis à jour : "${newPrefix}"`));
    } catch (err) {
      await ctx.reply(errorMessage(err.message));
    }
  },
};
