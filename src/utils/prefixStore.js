import { db } from '../database/database.js';
import { config } from '../config.js';

export function getPrefix() {
  return db.getSetting('prefix', config.prefix);
}

export function setPrefix(newPrefix) {
  if (!newPrefix || typeof newPrefix !== 'string' || newPrefix.length > 3) {
    throw new Error('Préfixe invalide.');
  }
  db.setSetting('prefix', newPrefix);
  return newPrefix;
}
