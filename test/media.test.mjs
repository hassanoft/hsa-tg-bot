import path from 'node:path';
import fs from 'node:fs';

const TMP_DIR = path.resolve('test/.tmp-media');
fs.rmSync(TMP_DIR, { recursive: true, force: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

process.env.BOT_NAME ??= 'H$Λ BOT';
process.env.PREFIX ??= '/';
process.env.BOT_TOKEN ??= 'FAKE:TOKEN';
process.env.OWNER_ID ??= '900000001';
process.env.DATA_DIR = path.join(TMP_DIR, 'data');
process.env.RATE_LIMIT_MAX ??= '1000';

const { loadCommands } = await import('../src/handlers/commandHandler.js');
const { handleIncomingMessage } = await import('../src/handlers/messageHandler.js');
const { TelegramAdapter } = await import('../src/telegram/telegramBot.js');
const { setTelegramBot } = await import('../src/utils/media.js');

let passed = 0;
let failed = 0;
function assert(cond, label) {
  if (cond) { passed += 1; console.log(`✅ ${label}`); }
  else { failed += 1; console.log(`❌ ${label}`); }
}

const USER_ID = 900000002;

const adapter = new TelegramAdapter('FAKE:TOKEN');
adapter.user = { id: '999999', name: 'H$Λ BOT Test', username: 'HsaBotTest' };
setTelegramBot(adapter);

const sent = [];
adapter.raw.on('__sent', (entry) => sent.push(entry));

// Intercepte fetch() pour simuler le téléchargement de fichiers Telegram
// (getFileLink renvoie une fausse URL ; on renvoie un faux buffer image/webp/audio).
const realFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  if (typeof url === 'string' && url.includes('api.telegram.org/file/fake/')) {
    return {
      ok: true,
      arrayBuffer: async () => Buffer.from('FAKE_DOWNLOADED_MEDIA').buffer,
    };
  }
  return realFetch(url);
};

function buildPhotoMessage(caption, extra = {}) {
  return {
    message_id: Math.floor(Math.random() * 1_000_000),
    date: Math.floor(Date.now() / 1000),
    chat: { id: USER_ID, type: 'private' },
    from: { id: USER_ID, first_name: 'Testeur', is_bot: false },
    caption,
    photo: [{ file_id: 'photo_small', width: 90, height: 90 }, { file_id: 'photo_large', width: 512, height: 512 }],
    ...extra,
  };
}

function buildTextMessage(text) {
  return {
    message_id: Math.floor(Math.random() * 1_000_000),
    date: Math.floor(Date.now() / 1000),
    chat: { id: USER_ID, type: 'private' },
    from: { id: USER_ID, first_name: 'Testeur', is_bot: false },
    text,
  };
}

function buildStickerMessage(caption) {
  return {
    message_id: Math.floor(Math.random() * 1_000_000),
    date: Math.floor(Date.now() / 1000),
    chat: { id: USER_ID, type: 'private' },
    from: { id: USER_ID, first_name: 'Testeur', is_bot: false },
    caption,
    sticker: { file_id: 'sticker_1', is_animated: false, is_video: false },
  };
}

async function send(msg) {
  sent.length = 0;
  await handleIncomingMessage(adapter, msg);
  return [...sent];
}

function textOf(entry) {
  return entry.text || entry.caption || '';
}
function hasErrorReply(out) {
  return out.some((m) => textOf(m).includes('❌'));
}
function hasPhotoReply(out) {
  return out.some((m) => m.method === 'sendPhoto');
}

async function main() {
  await loadCommands();

  // --- Commandes image (avec photo jointe directement, pas en citation) ---
  const imageCommands = ['blur', 'resize 100 100', 'rotate 90', 'mirror', 'caption Haut|Bas', 'wanted', 'avatar', 'wallpaper', 'enhance', 'upscale'];
  for (const cmdLine of imageCommands) {
    const out = await send(buildPhotoMessage(`/${cmdLine}`));
    const ok = hasPhotoReply(out) || hasErrorReply(out);
    assert(ok, `/${cmdLine.split(' ')[0]} répond sans planter (photo ou erreur propre)`);
  }

  // --- /sticker sur une image ---
  {
    const out = await send(buildPhotoMessage('/sticker'));
    const ok = out.some((m) => m.method === 'sendSticker') || hasErrorReply(out);
    assert(ok, '/sticker répond sans planter (sticker ou erreur propre)');
  }

  // --- /toimg sur un sticker statique ---
  {
    const out = await send(buildStickerMessage('/toimg'));
    const ok = hasPhotoReply(out) || hasErrorReply(out);
    assert(ok, '/toimg répond sans planter (photo ou erreur propre)');
  }

  // --- /qr génère un QR ---
  {
    const out = await send(buildTextMessage('/qr https://example.com'));
    assert(hasPhotoReply(out), '/qr génère une image');
  }

  // --- /readqr sur une image (jsQR stub renvoie null = "non détecté", ne doit pas planter) ---
  {
    const out = await send(buildPhotoMessage('/readqr'));
    assert(out.some((m) => textOf(m).includes('Aucun QR')), '/readqr gère proprement "aucun QR détecté"');
  }

  // --- /ocr (tesseract stub) ---
  {
    const out = await send(buildPhotoMessage('/ocr'));
    assert(out.some((m) => textOf(m).includes('TEXTE_SIMULE')), '/ocr extrait le texte simulé sans planter');
  }

  // --- /vision sans clé IA configurée -> message clair, pas de crash ---
  {
    const out = await send(buildPhotoMessage('/vision'));
    assert(out.some((m) => textOf(m).includes("n'est pas configuré")), '/vision sans clé API -> message clair');
  }

  // --- Commandes réseau externes (pas d'accès réseau réel en sandbox pour ip-api/tinyurl/exchangerate) ---
  const networkCommands = ['/ip 8.8.8.8', '/short https://example.com', '/currency 10 USD EUR'];
  for (const line of networkCommands) {
    const out = await send(buildTextMessage(line));
    assert(out.length > 0 && !out.some((m) => textOf(m).includes("erreur est survenue lors de l'")), `${line} échoue proprement sans crash serveur`);
  }

  console.log(`\n${passed} test(s) réussis, ${failed} échec(s).`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('ERREUR FATALE:', err);
  process.exit(1);
});
