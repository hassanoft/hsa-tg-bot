// Test fonctionnel hors-ligne : simule de vrais messages Telegram et les
// fait transiter à travers le vrai pipeline (messageHandler -> commandHandler
// -> commandes) pour vérifier le comportement réel du bot.
//
// Autonome : configure son propre environnement (aucun .env externe requis),
// avec un dossier de données temporaire dédié.

import path from 'node:path';
import fs from 'node:fs';

const TMP_DIR = path.resolve('test/.tmp-functional');
fs.rmSync(TMP_DIR, { recursive: true, force: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

process.env.BOT_NAME ??= 'H$Λ BOT';
process.env.PREFIX ??= '/';
process.env.BOT_TOKEN ??= 'FAKE:TOKEN';
process.env.OWNER_ID ??= '900000001';
process.env.DATA_DIR = path.join(TMP_DIR, 'data');
process.env.RATE_LIMIT_MAX ??= '1000'; // le test envoie volontairement beaucoup de commandes très vite
process.env.RATE_LIMIT_WINDOW_MS ??= '10000';

const { loadCommands, getAllCommands } = await import('../src/handlers/commandHandler.js');
const { handleIncomingMessage } = await import('../src/handlers/messageHandler.js');
const { TelegramAdapter } = await import('../src/telegram/telegramBot.js');
const { setTelegramBot } = await import('../src/utils/media.js');

let passed = 0;
let failed = 0;
function assert(cond, label) {
  if (cond) { passed += 1; console.log(`✅ ${label}`); }
  else { failed += 1; console.log(`❌ ${label}`); }
}

const OWNER_ID = 900000001;
const USER_ID = 900000002;
const GROUP_ID = -1001234567890;

const adapter = new TelegramAdapter('FAKE:TOKEN');
adapter.user = { id: '999999', name: 'H$Λ BOT Test', username: 'HsaBotTest' };
setTelegramBot(adapter);

// Configuration du "groupe" simulé côté stub node-telegram-bot-api
adapter.raw.__setChatInfo(GROUP_ID, { title: 'Groupe de test', description: 'Description de test', memberCount: 3 });
adapter.raw.__setChatAdmins(GROUP_ID, [
  { user: { id: 999999, first_name: 'H$Λ BOT Test' }, status: 'administrator' },
  { user: { id: OWNER_ID, first_name: 'Owner' }, status: 'creator' },
]);
adapter.raw.__setChatMemberStatus(GROUP_ID, 999999, 'administrator');
adapter.raw.__setChatMemberStatus(GROUP_ID, OWNER_ID, 'creator');
adapter.raw.__setChatMemberStatus(GROUP_ID, USER_ID, 'member');

const sent = [];
adapter.raw.on('__sent', (entry) => sent.push(entry));

function buildTextMessage({ from, chatId, text, isGroup = false, replyTo }) {
  return {
    message_id: Math.floor(Math.random() * 1_000_000),
    date: Math.floor(Date.now() / 1000),
    chat: { id: chatId, type: isGroup ? 'supergroup' : 'private' },
    from: { id: from, first_name: 'Testeur', is_bot: false },
    text,
    reply_to_message: replyTo,
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

async function main() {
  await loadCommands();
  assert(getAllCommands().length === 145, `145 commandes chargées (obtenu: ${getAllCommands().length})`);

  // --- /ping en privé ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/ping' }));
    assert(out.some((m) => textOf(m).includes('Calcul en cours') || m.method === 'editMessageText'), '/ping répond');
  }

  // --- message sans préfixe : aucune réponse ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: 'Bonjour' }));
    assert(out.length === 0, 'Message sans préfixe = aucune réponse');
  }

  // --- commande inconnue ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/xyzabc' }));
    assert(out.some((m) => textOf(m).includes('Commande inconnue')), 'Commande inconnue -> message clair');
  }

  // --- /calc ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/calc 2+2*5' }));
    assert(out.some((m) => textOf(m).includes('= 12')), `/calc 2+2*5 = 12 (reçu: ${JSON.stringify(out.map(textOf))})`);
  }

  // --- /calc division par zéro ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/calc 5/0' }));
    assert(out.some((m) => textOf(m).includes('❌')), '/calc 5/0 -> erreur propre (pas de crash)');
  }

  // --- commande OWNER par un utilisateur normal : refusée ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/maintenance on' }));
    assert(out.some((m) => textOf(m).includes('réservée au propriétaire')), 'Commande OWNER refusée à un utilisateur normal');
  }

  // --- commande OWNER par le OWNER : acceptée ---
  {
    const out = await send(buildTextMessage({ from: OWNER_ID, chatId: OWNER_ID, text: '/maintenance' }));
    assert(out.some((m) => textOf(m).includes('Mode maintenance')), 'Commande OWNER acceptée pour OWNER_ID');
  }

  // --- /help : menu complet ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/help' }));
    const text = out.map(textOf).join('');
    assert(text.includes('🏠 GENERAL') && text.includes('👑 OWNER') && text.trim().endsWith('H$Λ BOT'), '/help affiche le menu complet structuré');
    assert(text.includes('/ping'), "/help liste bien '/ping' avec le préfixe actuel");
  }

  // --- /help <catégorie> ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/help fun' }));
    const text = out.map(textOf).join('');
    assert(text.includes('🎮 FUN') && !text.includes('🏠 GENERAL'), '/help fun affiche uniquement la catégorie FUN');
  }

  // --- commande de groupe hors groupe : refusée ---
  {
    const out = await send(buildTextMessage({ from: OWNER_ID, chatId: OWNER_ID, text: '/kick' }));
    assert(out.some((m) => textOf(m).includes('uniquement dans un groupe')), 'Commande de groupe refusée en privé');
  }

  // --- commande de groupe, admin requis, utilisateur normal ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: GROUP_ID, isGroup: true, text: '/kick' }));
    assert(out.some((m) => textOf(m).includes('réservée aux administrateurs')), 'Commande admin de groupe refusée à un membre normal');
  }

  // --- /kick par OWNER (admin du groupe) sur un utilisateur (via reply) ---
  {
    const targetMsg = buildTextMessage({ from: USER_ID, chatId: GROUP_ID, isGroup: true, text: 'un message quelconque' });
    const out = await send(buildTextMessage({ from: OWNER_ID, chatId: GROUP_ID, isGroup: true, text: '/kick', replyTo: targetMsg }));
    assert(out.some((m) => m.method === 'banChatMember' && String(m.userId) === String(USER_ID)), '/kick bannit bien la cible visée par la réponse');
  }

  // --- /groupinfo ---
  {
    const out = await send(buildTextMessage({ from: OWNER_ID, chatId: GROUP_ID, isGroup: true, text: '/groupinfo' }));
    const text = out.map(textOf).join('');
    assert(text.includes('Groupe de test') && text.includes('Membres : 3') && text.includes('Administrateurs : 2'), `/groupinfo affiche les bonnes infos (reçu: ${text})`);
  }

  // --- /tagadmins ---
  {
    const out = await send(buildTextMessage({ from: OWNER_ID, chatId: GROUP_ID, isGroup: true, text: '/tagadmins' }));
    const text = out.map(textOf).join('');
    assert(text.includes('tg://user?id=') && text.includes(String(OWNER_ID)), '/tagadmins mentionne bien les administrateurs (lien tg://user)');
  }

  // --- /uuid ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/uuid' }));
    const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
    assert(out.some((m) => uuidRegex.test(textOf(m))), '/uuid génère un UUID valide');
  }

  // --- /base64 ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/base64 encode HelloHSA' }));
    assert(out.some((m) => textOf(m).includes(Buffer.from('HelloHSA').toString('base64'))), '/base64 encode fonctionne');
  }

  // --- /8ball ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/8ball Est-ce que ça marche ?' }));
    assert(out.some((m) => textOf(m).startsWith('🎱')), '/8ball répond');
  }

  // --- /contact mode 1 (texte direct) ---
  {
    const out = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: "/contact Bonjour, j'ai un souci." }));
    const confirmToUser = out.find((m) => String(m.chatId) === String(USER_ID));
    const forwardToOwner = out.find((m) => String(m.chatId) === String(OWNER_ID));
    assert(!!confirmToUser && textOf(confirmToUser).includes('transmis'), "/contact confirme la transmission à l'utilisateur");
    assert(!!forwardToOwner && textOf(forwardToOwner).includes('H$Λ BOT CONTACT'), '/contact transmet le message formaté à OWNER');
  }

  // --- /contact mode 2 (attente) puis réponse de OWNER ---
  {
    const out1 = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: '/contact' }));
    assert(out1.some((m) => textOf(m).includes('Envoyez maintenant')), '/contact sans texte déclenche le mode attente');

    const out2 = await send(buildTextMessage({ from: USER_ID, chatId: USER_ID, text: 'Voici mon message différé' }));
    const forwarded = out2.find((m) => String(m.chatId) === String(OWNER_ID));
    assert(!!forwarded && textOf(forwarded).includes('Voici mon message différé'), 'Le message différé est transmis à OWNER');

    // Simule OWNER répondant (fonction "Répondre") au message reçu, depuis SA PROPRE conversation avec le bot
    const forwardedAsIncoming = {
      message_id: forwarded.message_id,
      chat: { id: OWNER_ID, type: 'private' },
      from: { id: OWNER_ID },
      text: forwarded.text,
    };
    const replyMsg = buildTextMessage({
      from: OWNER_ID,
      chatId: OWNER_ID,
      text: 'Bonjour, je regarde ça tout de suite.',
      replyTo: forwardedAsIncoming,
    });
    const out3 = await send(replyMsg);
    const toUser = out3.find((m) => String(m.chatId) === String(USER_ID));
    assert(!!toUser && textOf(toUser).includes("Réponse de l'administrateur"), 'La réponse de OWNER est bien retransmise à l\'utilisateur');
  }

  console.log(`\n${passed} test(s) réussis, ${failed} échec(s).`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('ERREUR FATALE DANS LE TEST:', err);
  process.exit(1);
});
