import fs from 'node:fs';
import path from 'node:path';
import { config } from '../../config.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'backup',
  aliases: [],
  category: 'owner',
  ownerOnly: true,
  description: 'Envoie une sauvegarde des données persistantes (JSON) du bot.',
  async execute(ctx) {
    try {
      const files = fs.readdirSync(config.dataDir).filter((f) => f.endsWith('.json'));
      const bundle = {};
      for (const file of files) {
        bundle[file] = JSON.parse(fs.readFileSync(path.join(config.dataDir, file), 'utf8'));
      }
      const buffer = Buffer.from(JSON.stringify(bundle, null, 2), 'utf8');
      await ctx.bot.sendMessage(ctx.chatId, {
        document: buffer,
        mimetype: 'application/json',
        fileName: `hsa-bot-backup-${Date.now()}.json`,
      }, { quoted: ctx.msg });
    } catch (err) {
      await ctx.reply(errorMessage('Échec de la génération de la sauvegarde.'));
    }
  },
};
