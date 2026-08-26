// Logger interne minimaliste — pas de dépendance externe.
// Ne jamais logger : clés API, tokens, BOT_TOKEN, données privées.

import fs from 'node:fs';
import path from 'node:path';

const LEVELS = { trace: 0, debug: 1, info: 2, warn: 3, error: 4, fatal: 5, silent: 6 };
const COLORS = {
  trace: '\x1b[90m', debug: '\x1b[36m', info: '\x1b[32m',
  warn: '\x1b[33m', error: '\x1b[31m', fatal: '\x1b[41m',
};
const RESET = '\x1b[0m';

const SENSITIVE_KEYS = /(key|token|secret|password|creds|authorization|noiseKey|signedIdentityKey)/i;

const LOG_DIR = path.resolve(process.env.DATA_DIR || './data', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'bot.log');
const MAX_LOG_BYTES = 2 * 1024 * 1024; // 2 Mo, rotation simple

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch {
    // best-effort : si le disque n'est pas accessible, on continue sans fichier
  }
}

function appendToFile(line) {
  try {
    ensureLogDir();
    if (fs.existsSync(LOG_FILE) && fs.statSync(LOG_FILE).size > MAX_LOG_BYTES) {
      fs.renameSync(LOG_FILE, `${LOG_FILE}.old`);
    }
    fs.appendFile(LOG_FILE, `${line}\n`, () => {});
  } catch {
    // best-effort
  }
}

export function readRecentLogs(maxLines = 40) {
  try {
    if (!fs.existsSync(LOG_FILE)) return [];
    const content = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = content.split('\n').filter(Boolean);
    return lines.slice(-maxLines);
  } catch {
    return [];
  }
}

function redact(arg) {
  if (arg && typeof arg === 'object') {
    try {
      const clone = Array.isArray(arg) ? [...arg] : { ...arg };
      for (const k of Object.keys(clone)) {
        if (SENSITIVE_KEYS.test(k)) clone[k] = '[REDACTED]';
      }
      return clone;
    } catch {
      return arg;
    }
  }
  return arg;
}

function createLogger(scope = 'H$Λ', minLevel = process.env.LOG_LEVEL || 'info') {
  const threshold = LEVELS[minLevel] ?? LEVELS.info;

  function log(level, ...args) {
    if (LEVELS[level] < threshold) return;
    const color = COLORS[level] || '';
    const ts = new Date().toISOString();
    const safeArgs = args.map(redact);
    // eslint-disable-next-line no-console
    console.log(`${color}[${ts}] [${level.toUpperCase()}] [${scope}]${RESET}`, ...safeArgs);
    appendToFile(`[${ts}] [${level.toUpperCase()}] [${scope}] ${safeArgs.map(String).join(' ')}`);
  }

  const logger = {
    level: minLevel,
    trace: (...a) => log('trace', ...a),
    debug: (...a) => log('debug', ...a),
    info: (...a) => log('info', ...a),
    warn: (...a) => log('warn', ...a),
    error: (...a) => log('error', ...a),
    fatal: (...a) => log('fatal', ...a),
    child(bindings = {}) {
      const childScope = bindings.class || bindings.scope || scope;
      return createLogger(`${scope}:${childScope}`, minLevel);
    },
  };

  return logger;
}

export const logger = createLogger('H$Λ');
export default logger;
