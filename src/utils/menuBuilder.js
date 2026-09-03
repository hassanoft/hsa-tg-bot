// Construction du menu /help - /menu.
// Le design visuel ci-dessous est OBLIGATOIRE et ne doit pas être modifié
// (voir cahier des charges, section 8) : séparateurs, ordre des catégories,
// une commande par ligne, jamais de commande coupée sur deux lignes.

import { formatBytes, formatDuration } from './formatter.js';
import { getUptimeMs } from './uptime.js';

const SEPARATOR = '_____________________________';

export const MENU_CATEGORIES = [
  {
    key: 'general',
    title: '🏠 GENERAL',
    commands: ['help', 'menu', 'ping', 'alive', 'runtime', 'botinfo', 'owner', 'stats', 'speed', 'report', 'contact'],
  },
  {
    key: 'ai',
    title: '🤖 IA',
    commands: [
      'ai', 'ask', 'chat', 'imagine', 'vision', 'ocr', 'translate',
      'summarize', 'rewrite', 'grammar', 'explain', 'code', 'debug', 'prompt', 'tts',
    ],
  },
  {
    key: 'image',
    title: '🖼️ IMAGE',
    commands: [
      'sticker', 's', 'toimg', 'removebg', 'enhance', 'upscale', 'blur', 'crop',
      'resize', 'rotate', 'mirror', 'caption', 'wanted', 'logo', 'avatar', 'wallpaper', 'meme',
    ],
  },
  {
    key: 'video',
    title: '🎬 VIDÉO',
    commands: ['video', 'mp3', 'gif', 'trim', 'compress', 'mute', 'extract', 'thumbnail', 'videostatus'],
  },
  {
    key: 'audio',
    title: '🎵 AUDIO',
    commands: ['play', 'song', 'lyrics', 'voice', 'bass', 'speedaudio', 'audioinfo', 'tomp3'],
  },
  {
    key: 'download',
    title: '📥 DOWNLOAD',
    commands: ['yt', 'ytmp3', 'ytmp4', 'tiktok', 'instagram', 'facebook', 'twitter', 'mediafire', 'gdrive'],
  },
  {
    key: 'tools',
    title: '🛠️ UTILITAIRES',
    commands: [
      'calc', 'qr', 'readqr', 'short', 'weather', 'time', 'date', 'currency', 'convert',
      'password', 'uuid', 'base64', 'decode', 'json', 'ip', 'domain', 'pinghost',
    ],
  },
  {
    key: 'group',
    title: '👥 GROUPES',
    commands: [
      'kick', 'add', 'promote', 'demote', 'warn', 'unwarn', 'warnings', 'tagall', 'hidetag',
      'tagadmins', 'groupinfo', 'linkgroup', 'revoke', 'setname', 'setdesc', 'setphoto', 'open', 'close',
    ],
  },
  {
    key: 'moderation',
    title: '🛡️ MODÉRATION',
    commands: [
      'antilink', 'antispam', 'antibadword', 'antiflood', 'antinsfw',
      'welcome', 'goodbye', 'autoread', 'autotyping', 'autorecording',
    ],
  },
  {
    key: 'fun',
    title: '🎮 FUN',
    commands: [
      '8ball', 'dice', 'coin', 'quiz', 'trivia', 'riddle', 'joke', 'meme', 'ship',
      'love', 'rate', 'roast', 'truth', 'dare', 'character', 'guess',
      'guessnumber', 'dart', 'bowling', 'slot',
    ],
  },
  {
    key: 'sport',
    title: '⚽ SPORT',
    commands: ['football', 'basketball', 'tennis', 'running', 'fitness'],
  },
  {
    key: 'owner',
    title: '👑 OWNER',
    commands: [
      'broadcast', 'ban', 'unban', 'block', 'unblock', 'addadmin', 'deladmin', 'listadmin',
      'setprefix', 'maintenance', 'eval', 'exec', 'restart', 'shutdown', 'backup', 'logs',
    ],
  },
];

function renderCategoryBlock(category, prefix) {
  const lines = category.commands.map((cmd, i) => {
    const branch = i === category.commands.length - 1 ? '└─' : '├─';
    return `${branch} ${prefix}${cmd}`;
  });
  return `${category.title}\n${lines.join('\n')}`;
}

export function buildIdentityBlock(ctx) {
  const name = ctx.bot.user?.name || 'H$Λ BOT';
  const pingMs = Math.max(0, Date.now() - Number(ctx.msg.date) * 1000);
  const memory = formatBytes(process.memoryUsage().rss);
  const admin = ctx.isGroup ? (ctx.isSenderGroupAdmin ? 'Oui' : 'Non') : 'N/A';

  return (
    `Name : ${name}\n` +
    `Préfixe : ${ctx.prefix}\n` +
    `Ping : ${pingMs} ms\n` +
    `Mémoire : ${memory}\n` +
    `Admin : ${admin}`
  );
}

export function buildFullMenu(ctx) {
  const blocks = MENU_CATEGORIES.map((c) => renderCategoryBlock(c, ctx.prefix));
  return (
    `${SEPARATOR}\n\n` +
    `${buildIdentityBlock(ctx)}\n\n` +
    `${SEPARATOR}\n\n` +
    `${blocks.join('\n\n')}\n\n` +
    `${SEPARATOR}\n\n` +
    `H$Λ BOT`
  );
}

export function buildCategoryMenu(ctx, categoryKey) {
  const category = MENU_CATEGORIES.find((c) => c.key === categoryKey.toLowerCase());
  if (!category) return null;
  return (
    `${SEPARATOR}\n\n` +
    `${buildIdentityBlock(ctx)}\n\n` +
    `${SEPARATOR}\n\n` +
    `${renderCategoryBlock(category, ctx.prefix)}\n\n` +
    `${SEPARATOR}\n\n` +
    `H$Λ BOT`
  );
}

/** Tente de récupérer la photo de profil du bot Telegram connecté. Ne lève jamais d'erreur. */
export async function getConnectedProfilePicture(bot) {
  try {
    const photos = await bot.raw.getUserProfilePhotos(bot.user.id, { limit: 1 });
    const fileId = photos?.photos?.[0]?.[photos.photos[0].length - 1]?.file_id;
    if (!fileId) return null;
    const url = await bot.raw.getFileLink(fileId);
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null; // pas de photo disponible : le menu doit quand même s'envoyer (règle 3 / section 8)
  }
}

export const CATEGORY_KEYS = MENU_CATEGORIES.map((c) => c.key);

// Telegram limite les légendes (caption) de photo à 1024 caractères, contre
// 4096 pour un message texte classique. Le menu complet dépasse presque
// toujours 1024 caractères : on ne peut donc pas le mettre en légende sans
// risquer un rejet par l'API (c'était le bug : la photo passait, mais
// l'envoi échouait dès que la légende dépassait la limite).
const TELEGRAM_CAPTION_LIMIT = 1024;

/** Utilisée par /help et /menu (doivent afficher exactement le même menu — règle 20). */
export async function sendMenu(ctx, categoryArg) {
  let text;

  if (categoryArg) {
    text = buildCategoryMenu(ctx, categoryArg);
    if (!text) {
      await ctx.reply(`❌ Catégorie inconnue.\nCatégories disponibles : ${CATEGORY_KEYS.join(', ')}`);
      return;
    }
  } else {
    text = buildFullMenu(ctx);
  }

  const photo = await getConnectedProfilePicture(ctx.bot);
  if (!photo) {
    await ctx.reply(text);
    return;
  }

  if (text.length <= TELEGRAM_CAPTION_LIMIT) {
    // Assez court pour tenir en légende : un seul message photo+texte.
    await ctx.bot.sendMessage(ctx.chatId, { image: photo, caption: text }, { quoted: ctx.msg });
  } else {
    // Trop long pour une légende : la photo part seule, suivie du menu en texte.
    await ctx.bot.sendMessage(ctx.chatId, { image: photo }, { quoted: ctx.msg });
    await ctx.reply(text);
  }
}
