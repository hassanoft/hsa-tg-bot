import { exec as execCb } from 'node:child_process';
import util from 'node:util';

const exec = util.promisify(execCb);

export default {
  name: 'exec',
  aliases: ['sh'],
  category: 'owner',
  ownerOnly: true,
  description: 'Exécute une commande shell sur le serveur (OWNER uniquement — usage à vos risques).',
  async execute(ctx) {
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}exec <commande shell>`);
      return;
    }
    try {
      const { stdout, stderr } = await exec(ctx.text, { timeout: 20_000, maxBuffer: 1024 * 1024 });
      const output = (stdout || stderr || '(aucune sortie)').toString();
      await ctx.reply(`\`\`\`${output.slice(0, 3500)}\`\`\``);
    } catch (err) {
      await ctx.reply(`❌ Erreur :\n\`\`\`${String(err.message).slice(0, 2000)}\`\`\``);
    }
  },
};
