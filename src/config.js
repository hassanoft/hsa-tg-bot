import 'dotenv/config';
import path from 'node:path';

function int(value, def) {
  const n = parseInt(value, 10);
  return Number.isFinite(n) ? n : def;
}

const DATA_DIR = process.env.DATA_DIR || './data';

export const config = {
  botName: process.env.BOT_NAME || 'H$Λ BOT',
  prefix: process.env.PREFIX || '/',

  botToken: process.env.BOT_TOKEN || '',
  ownerId: (process.env.OWNER_ID || '').replace(/\D/g, ''),
  statusChannelId: process.env.STATUS_CHANNEL_ID || '',

  port: int(process.env.PORT, 3000),

  dataDir: path.resolve(DATA_DIR),

  ai: {
    apiKey: process.env.AI_API_KEY || '',
    apiUrl: process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    imageApiUrl: process.env.AI_IMAGE_API_URL || 'https://api.openai.com/v1/images/generations',
    imageModel: process.env.AI_IMAGE_MODEL || 'dall-e-3',
    ttsApiUrl: process.env.TTS_API_URL || '',
    ttsApiKey: process.env.TTS_API_KEY || '',
  },

  image: {
    removeBgKey: process.env.REMOVEBG_API_KEY || '',
    removeBgUrl: process.env.REMOVEBG_API_URL || 'https://api.remove.bg/v1.0/removebg',
    upscaleUrl: process.env.IMAGE_UPSCALE_API_URL || '',
    upscaleKey: process.env.IMAGE_UPSCALE_API_KEY || '',
  },

  download: {
    // Aucune clé API externe : téléchargement via yt-dlp (YouTube/TikTok/
    // Instagram/Facebook/Twitter) ou scraping HTTP direct (MediaFire/Drive).
    ytDlpPath: process.env.YTDLP_PATH || 'yt-dlp',
    maxSizeMb: int(process.env.DOWNLOAD_MAX_MB, 50),
    timeoutMs: int(process.env.DOWNLOAD_TIMEOUT_MS, 60_000),
    maxConcurrentPerUser: int(process.env.MAX_CONCURRENT_DOWNLOADS_PER_USER, 1),
  },

  weather: {
    apiKey: process.env.WEATHER_API_KEY || '',
    apiUrl: process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5/weather',
  },

  currency: {
    apiUrl: process.env.CURRENCY_API_URL || 'https://api.exchangerate.host/latest',
  },

  nsfw: {
    apiUrl: process.env.NSFW_API_URL || '',
    apiKey: process.env.NSFW_API_KEY || '',
  },

  ffmpegPath: process.env.FFMPEG_PATH || '',

  http: {
    userAgent:
      process.env.HTTP_USER_AGENT ||
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    timeoutMs: int(process.env.HTTP_TIMEOUT_MS, 15_000),
    retries: int(process.env.HTTP_RETRIES, 2),
  },

  rateLimit: {
    max: int(process.env.RATE_LIMIT_MAX, 8),
    windowMs: int(process.env.RATE_LIMIT_WINDOW_MS, 10000),
  },
};

/** OWNER est toujours un utilisateur Telegram distinct du bot (pas de notion de "self-bot" comme sur WhatsApp). */
export function isOwner(userId) {
  const digits = String(userId).replace(/\D/g, '');
  return !!config.ownerId && digits === config.ownerId;
}
