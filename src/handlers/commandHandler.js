import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { logger } from '../utils/logger.js';
import { checkCommandPermissions } from '../utils/permissions.js';
import {
  ownerOnlyMessage,
  adminOnlyMessage,
  groupOnlyMessage,
  botAdminRequiredMessage,
  maintenanceMessage,
  unknownCommandMessage,
  errorMessage,
} from '../utils/formatter.js';
import { config } from '../config.js';
import { db } from '../database/database.js';
import { isRateLimited } from '../utils/rateLimiter.js';

const log = logger.child({ class: 'commandHandler' });
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = path.join(__dirname, '..', 'commands');

const commands = new Map(); // name -> command module
const aliasMap = new Map(); // alias -> canonical name

export async function loadCommands() {
  commands.clear();
  aliasMap.clear();

  const categories = fs
    .readdirSync(COMMANDS_DIR)
    .filter((f) => fs.statSync(path.join(COMMANDS_DIR, f)).isDirectory());

  for (const category of categories) {
    const dir = path.join(COMMANDS_DIR, category);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && !f.startsWith('_'));

    for (const file of files) {
      const modUrl = pathToFileURL(path.join(dir, file)).href;
      try {
        const mod = await import(modUrl);
        const cmd = mod.default;
        if (!cmd?.name || typeof cmd.execute !== 'function') {
          log.warn(`Commande invalide ignorée : ${category}/${file}`);
          continue;
        }
        cmd.category = cmd.category || category;
        commands.set(cmd.name, cmd);
        for (const alias of cmd.aliases || []) aliasMap.set(alias, cmd.name);
      } catch (err) {
        log.error(`Échec du chargement de la commande ${category}/${file}`, err.message, err.stack);
      }
    }
  }

  log.info(`${commands.size} commandes chargées depuis ${categories.length} catégories.`);
  return commands;
}

export function getCommand(name) {
  if (!name) return null;
  return commands.get(name) || commands.get(aliasMap.get(name)) || null;
}

export function getAllCommands() {
  return [...commands.values()];
}

export function getCommandsByCategory(category) {
  return getAllCommands().filter((c) => c.category === category);
}

export function getCategories() {
  return [...new Set(getAllCommands().map((c) => c.category))];
}

/**
 * Exécute une commande à partir d'un contexte déjà construit par messageHandler.js.
 * ctx doit contenir : commandName, args, text, sender/senderId, chatId, isGroup,
 * isOwner, isBotAdmin, isSenderGroupAdmin, isBotGroupAdmin, reply(), bot, msg.
 */
export async function dispatchCommand(ctx) {
  const command = getCommand(ctx.commandName);

  if (!command) {
    await ctx.reply(unknownCommandMessage(config.prefix));
    return;
  }

  // Maintenance : seul OWNER garde l'accès
  if (db.getSetting('maintenance', false) && !ctx.isOwner) {
    await ctx.reply(maintenanceMessage());
    return;
  }

  if (db.isBanned(ctx.senderId)) {
    await ctx.reply(errorMessage("Vous n'êtes pas autorisé à utiliser H$Λ BOT."));
    return;
  }

  if (isRateLimited(ctx.senderId)) {
    await ctx.reply(errorMessage('Trop de commandes envoyées. Merci de patienter quelques secondes.'));
    return;
  }

  const permission = checkCommandPermissions(command, ctx);
  if (!permission.allowed) {
    const messages = {
      owner: ownerOnlyMessage(),
      admin: adminOnlyMessage(),
      group: groupOnlyMessage(),
      private: errorMessage('Cette commande fonctionne uniquement en message privé.'),
      'bot-admin': botAdminRequiredMessage(),
    };
    await ctx.reply(messages[permission.reason] || errorMessage('Permission refusée.'));
    return;
  }

  try {
    db.incrementStat('commandsExecuted');
    await command.execute(ctx);
  } catch (err) {
    log.error(`Erreur lors de l'exécution de /${command.name}`, err.message, err.stack);
    db.incrementStat('errors');
    await ctx.reply(errorMessage("Une erreur est survenue lors de l'exécution de cette commande."));
  }
}
