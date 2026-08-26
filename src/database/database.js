// Base de données persistante pour H$Λ BOT.
//
// Choix technique : stockage JSON sur disque (un fichier par collection),
// avec écriture atomique (tmp + rename). Aucune dépendance native requise
// (compatible Termux). C'est une "solution persistante" au sens de la
// consigne (SQLite OU solution persistante équivalente).
//
// ATTENTION (Render) : le plan gratuit utilise un filesystem éphémère.
// Pour une persistance réelle en production, montez un Persistent Disk
// Render sur DATA_DIR (voir render.yaml et README.md), ou migrez cette
// couche vers PostgreSQL (l'architecture — une classe Collection avec une
// interface get/set/delete/all — a été pensée pour rendre cette migration
// simple : il suffit de réimplémenter Collection avec des requêtes SQL).

import fs from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { logger } from '../utils/logger.js';

const log = logger.child({ class: 'database' });

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

class Collection {
  constructor(name, dir) {
    this.name = name;
    this.file = path.join(dir, `${name}.json`);
    this.data = {};
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.file)) {
        const raw = fs.readFileSync(this.file, 'utf8');
        this.data = raw ? JSON.parse(raw) : {};
      } else {
        this.data = {};
        this._flush();
      }
    } catch (err) {
      log.error(`Échec de lecture de la collection "${this.name}", initialisation vide.`, err.message);
      this.data = {};
    }
  }

  _flush() {
    try {
      const tmp = `${this.file}.tmp`;
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), 'utf8');
      fs.renameSync(tmp, this.file);
    } catch (err) {
      log.error(`Échec d'écriture de la collection "${this.name}".`, err.message);
    }
  }

  get(id) {
    return this.data[id];
  }

  has(id) {
    return Object.prototype.hasOwnProperty.call(this.data, id);
  }

  set(id, value) {
    this.data[id] = value;
    this._flush();
    return value;
  }

  update(id, patch) {
    const current = this.data[id] || {};
    const next = { ...current, ...patch };
    this.data[id] = next;
    this._flush();
    return next;
  }

  delete(id) {
    const existed = this.has(id);
    delete this.data[id];
    if (existed) this._flush();
    return existed;
  }

  all() {
    return this.data;
  }

  values() {
    return Object.values(this.data);
  }

  keys() {
    return Object.keys(this.data);
  }

  find(predicate) {
    return this.values().find(predicate);
  }

  filter(predicate) {
    return this.values().filter(predicate);
  }

  count() {
    return this.keys().length;
  }
}

class Database {
  constructor() {
    ensureDir(config.dataDir);

    this.users = new Collection('users', config.dataDir);
    this.groups = new Collection('groups', config.dataDir);
    this.admins = new Collection('admins', config.dataDir);
    this.groupSettings = new Collection('group_settings', config.dataDir);
    this.warnings = new Collection('warnings', config.dataDir);
    this.botSettings = new Collection('bot_settings', config.dataDir);
    this.stats = new Collection('stats', config.dataDir);
    this.contactMessages = new Collection('contact_messages', config.dataDir);
    this.groupMembers = new Collection('group_members', config.dataDir);

    log.info(`Base de données JSON initialisée dans ${config.dataDir}`);
  }

  // ---------- USERS ----------
  touchUser(jid, patch = {}) {
    const current = this.users.get(jid) || { jid, firstSeen: Date.now(), banned: false, warnings: 0 };
    return this.users.update(jid, { ...current, ...patch, lastSeen: Date.now() });
  }

  isBanned(jid) {
    return !!this.users.get(jid)?.banned;
  }

  setBanned(jid, banned) {
    return this.touchUser(jid, { banned });
  }

  // ---------- GROUPS ----------
  touchGroup(jid, patch = {}) {
    const current = this.groups.get(jid) || { jid, firstSeen: Date.now() };
    return this.groups.update(jid, { ...current, ...patch, lastSeen: Date.now() });
  }

  // ---------- BOT ADMINS (niveau applicatif, distinct des admins de groupe Telegram) ----------
  addBotAdmin(jid) {
    const list = this.botSettings.get('admins') || [];
    if (!list.includes(jid)) list.push(jid);
    return this.botSettings.set('admins', list);
  }

  removeBotAdmin(jid) {
    const list = (this.botSettings.get('admins') || []).filter((x) => x !== jid);
    return this.botSettings.set('admins', list);
  }

  listBotAdmins() {
    return this.botSettings.get('admins') || [];
  }

  isBotAdmin(jid) {
    return this.listBotAdmins().includes(jid);
  }

  // ---------- GROUP SETTINGS ----------
  getGroupSettings(groupId) {
    return (
      this.groupSettings.get(groupId) || {
        antilink: false,
        antilinkWhitelist: [],
        antispam: false,
        antibadword: false,
        antibadwordList: [],
        antiflood: false,
        antinsfw: false,
        welcome: false,
        welcomeMessage: '',
        goodbye: false,
        goodbyeMessage: '',
        autoread: false,
        autotyping: false,
        autorecording: false,
        warnLimit: 3,
      }
    );
  }

  updateGroupSettings(groupId, patch) {
    const current = this.getGroupSettings(groupId);
    const next = { ...current, ...patch };
    this.groupSettings.set(groupId, next);
    return next;
  }

  // ---------- WARNINGS ----------
  addWarning(groupId, userId, reason = '') {
    const key = `${groupId}:${userId}`;
    const list = this.warnings.get(key) || [];
    list.push({ reason, date: Date.now() });
    this.warnings.set(key, list);
    return list;
  }

  removeWarning(groupId, userId) {
    const key = `${groupId}:${userId}`;
    const list = this.warnings.get(key) || [];
    list.pop();
    this.warnings.set(key, list);
    return list;
  }

  getWarnings(groupId, userId) {
    return this.warnings.get(`${groupId}:${userId}`) || [];
  }

  clearWarnings(groupId, userId) {
    return this.warnings.delete(`${groupId}:${userId}`);
  }

  // ---------- BOT SETTINGS (préfixe, maintenance, etc.) ----------
  getSetting(key, def = undefined) {
    return this.botSettings.has(key) ? this.botSettings.get(key) : def;
  }

  setSetting(key, value) {
    return this.botSettings.set(key, value);
  }

  // ---------- STATS ----------
  incrementStat(key, by = 1) {
    const current = this.stats.get(key) || 0;
    const next = current + by;
    this.stats.set(key, next);
    return next;
  }

  getStat(key) {
    return this.stats.get(key) || 0;
  }

  // ---------- CONTACT MESSAGES ----------
  saveContactMessage(entry) {
    // entry: { id, contactMessageId, userId, ownerId, timestamp, status }
    this.contactMessages.set(entry.contactMessageId, entry);
    return entry;
  }

  getContactMessageById(contactMessageId) {
    return this.contactMessages.get(contactMessageId);
  }

  updateContactMessageStatus(contactMessageId, status) {
    if (!this.contactMessages.has(contactMessageId)) return null;
    return this.contactMessages.update(contactMessageId, { status });
  }

  // ---------- MEMBRES DE GROUPE CONNUS ----------
  // LIMITATION TELEGRAM : l'API Bot ne permet pas de lister tous les membres
  // d'un groupe (seuls les administrateurs sont accessibles). Ce registre
  // "best effort" retient les membres vus écrire dans le groupe, pour
  // permettre à /tagall et /hidetag de fonctionner malgré cette limitation.
  trackGroupMember(groupId, userId, name) {
    const members = this.groupMembers.get(groupId) || {};
    members[userId] = { name, lastSeen: Date.now() };
    this.groupMembers.set(groupId, members);
  }

  getGroupMembers(groupId) {
    const members = this.groupMembers.get(groupId) || {};
    return Object.entries(members).map(([id, info]) => ({ id, name: info.name }));
  }
}

export const db = new Database();
export default db;
