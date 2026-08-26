# H$Λ BOT (Telegram)

Bot Telegram multifonction, **100 % gratuit**, construit avec [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api), Node.js (ES Modules) et Express. Architecture modulaire, prêt pour Termux, Linux et Render.

Aucune fonctionnalité payante : pas de premium, pas de crédits, pas d'abonnement.

> Cette version remplace la version WhatsApp/Baileys du même projet. L'architecture interne (commandes, services, base de données) est restée quasiment identique — seule la couche de connexion à la plateforme a changé.

---

## Sommaire

1. [Présentation](#1-présentation)
2. [Fonctionnalités](#2-fonctionnalités)
3. [Installation sur Termux](#3-installation-sur-termux)
4. [Installation sur Linux](#4-installation-sur-linux)
5. [Configuration (.env)](#5-configuration-env)
6. [Création du bot (@BotFather)](#6-création-du-bot-botfather)
7. [Propriétaire (OWNER)](#7-propriétaire-owner)
8. [APIs externes](#8-apis-externes)
9. [Base de données](#9-base-de-données)
10. [Déploiement sur Render](#10-déploiement-sur-render)
11. [Liste des commandes](#11-liste-des-commandes)
12. [Configuration des groupes](#12-configuration-des-groupes)
13. [Système /contact](#13-système-contact)
14. [Limitations propres à Telegram](#14-limitations-propres-à-telegram)
15. [Dépannage](#15-dépannage)
16. [Sécurité](#16-sécurité)

---

## 1. Présentation

**H$Λ BOT** est un bot Telegram multifonction : intelligence artificielle, traitement d'image et de vidéo, téléchargement, utilitaires, gestion de groupes, modération automatique et un véritable système de messagerie `/contact` entre les utilisateurs et le propriétaire du bot.

Le projet est volontairement **honnête techniquement** : toute fonctionnalité nécessitant une API externe (IA, météo, suppression de fond, etc.) affiche un message clair si la clé correspondante n'est pas configurée, plutôt que de simuler un résultat. De même, les fonctionnalités qui n'ont pas d'équivalent exact sur Telegram (voir [§14](#14-limitations-propres-à-telegram)) le disent explicitement au lieu de prétendre fonctionner.

## 2. Fonctionnalités

- 🤖 IA (chat, traduction, résumé, vision, OCR local, TTS...)
- 🖼️ Traitement d'image 100 % local (Jimp) : resize, crop, rotate, blur, mèmes, stickers...
- 🎬 Traitement vidéo/audio via ffmpeg : conversion, découpe, compression, extraction audio...
- 📥 Téléchargement (YouTube, TikTok, Instagram, Facebook, Twitter, MediaFire, Google Drive)
- 🛠️ Utilitaires (calculatrice sécurisée, QR code, météo, devises, mots de passe...)
- 👥 Gestion de groupe (kick, promote, mentions, avertissements...)
- 🛡️ Modération automatique (antilink, antispam, antibadword, antiflood, welcome/goodbye...)
- 🎮 Commandes fun (quiz, devinettes, 8ball, action ou vérité...)
- 👑 Panneau OWNER (broadcast, maintenance, eval, backup, logs...)
- 📩 Système `/contact` bidirectionnel et persistant entre utilisateurs et OWNER

## 3. Installation sur Termux

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts git ffmpeg

git clone <url-de-votre-dépôt> hsa-tg-bot
cd hsa-tg-bot
npm install

cp .env.example .env
nano .env   # renseignez au minimum BOT_TOKEN et OWNER_ID

npm start
```

> `ffmpeg` est requis pour les commandes vidéo/audio/sticker. Sans lui, ces commandes afficheront une erreur claire au lieu de planter.

## 4. Installation sur Linux

```bash
sudo apt update && sudo apt install -y nodejs npm ffmpeg git
# (Node.js >= 18 recommandé — utilisez nvm si votre distribution fournit une version trop ancienne)

git clone <url-de-votre-dépôt> hsa-tg-bot
cd hsa-tg-bot
npm install

cp .env.example .env
nano .env

npm start        # production
npm run dev       # développement (redémarrage automatique)
```

## 5. Configuration (.env)

Copiez `.env.example` en `.env` et renseignez vos valeurs. Variables essentielles :

| Variable | Description |
|---|---|
| `BOT_NAME` | Nom affiché du bot (par défaut `H$Λ BOT`) |
| `PREFIX` | Préfixe des commandes (par défaut `/`) |
| `BOT_TOKEN` | Jeton du bot obtenu via @BotFather |
| `OWNER_ID` | Identifiant numérique Telegram du propriétaire (PAS un numéro de téléphone) |
| `STATUS_CHANNEL_ID` | (optionnel) canal pour `/videostatus`, voir [§14](#14-limitations-propres-à-telegram) |
| `PORT` | Port du serveur HTTP (Render l'impose automatiquement) |
| `DATA_DIR` | Emplacement des données persistantes |

Toutes les autres variables (IA, météo, téléchargement, etc.) sont **optionnelles** : chaque fonctionnalité concernée reste désactivée avec un message clair tant que sa clé n'est pas renseignée. Voir `.env.example` pour la liste complète et commentée.

## 6. Création du bot (@BotFather)

1. Ouvrez une conversation avec [@BotFather](https://t.me/BotFather) sur Telegram.
2. Envoyez `/newbot` et suivez les instructions (nom, puis nom d'utilisateur se terminant par "bot").
3. BotFather vous donne un **jeton** au format `123456789:AAExempleDeJetonAleatoire` — collez-le dans `BOT_TOKEN`.
4. (Recommandé) Envoyez `/setprivacy` à BotFather, choisissez votre bot, puis `Disable` — cela permet au bot de lire tous les messages d'un groupe (nécessaire pour la modération automatique, l'antilink, etc.). Sans cela, le bot ne reçoit que les messages qui commencent par `/`.
5. Démarrez le bot (`npm start`). Aucun code d'appairage n'est nécessaire : la connexion se fait uniquement via `BOT_TOKEN`, par interrogation (*polling*) de l'API Telegram.
6. Pour connaître votre propre identifiant Telegram (`OWNER_ID`), envoyez un message à [@userinfobot](https://t.me/userinfobot).

## 7. Propriétaire (OWNER)

`OWNER_ID` définit qui a accès aux commandes du panneau `👑 OWNER` (broadcast, maintenance, eval, backup...), ainsi qu'aux commandes `adminOnly` de groupe par défaut. Cette vérification est faite **côté serveur** à chaque commande — jamais uniquement via l'affichage du menu.

Contrairement à la version WhatsApp, OWNER est **toujours un compte Telegram distinct du bot** (un bot Telegram n'est jamais "son propre propriétaire").

⚠️ Telegram empêche un bot d'écrire en premier à un utilisateur qui ne lui a jamais parlé. **OWNER doit envoyer au moins un message (ex: `/start`) au bot avant** que les commandes `/contact` et `/report` puissent lui transmettre des messages.

Des administrateurs applicatifs supplémentaires peuvent être ajoutés avec `/addadmin` (niveau intermédiaire entre OWNER et USER, voir [§16](#16-sécurité)).

## 8. APIs externes

Aucune clé n'est fournie avec le projet. Chaque intégration est **optionnelle** et clairement indiquée dans `.env.example` :

| Fonctionnalité | Variable(s) | Sans clé configurée |
|---|---|---|
| IA (chat, traduction, résumé...) | `AI_API_KEY`, `AI_API_URL`, `AI_MODEL` | Message "service non configuré" |
| Génération d'image | `AI_API_KEY`, `AI_IMAGE_API_URL` | Idem |
| Synthèse vocale | `TTS_API_URL`, `TTS_API_KEY` | Idem |
| Suppression de fond | `REMOVEBG_API_KEY` | Idem |
| Upscaling IA | `IMAGE_UPSCALE_API_URL` | Repli automatique sur un upscaling classique local (sans IA) |
| Téléchargement YT/TikTok/IG/FB/Twitter | `DOWNLOAD_API_URL`, `DOWNLOAD_API_KEY` | Message "service non configuré" |
| Météo | `WEATHER_API_KEY` | Idem |
| Anti-NSFW | `NSFW_API_URL` | La fonctionnalité refuse de s'activer |

Certaines commandes (`/qr`, `/readqr`, `/ocr`, images locales, `/short`, `/currency`, `/lyrics`, `/domain`) fonctionnent **sans aucune clé**, via des traitements 100 % locaux ou des API publiques gratuites reconnues.

⚠️ Pour le téléchargement (YouTube, TikTok, Instagram, Facebook, Twitter), branchez un fournisseur tiers **conforme aux CGU des plateformes concernées**.

## 9. Base de données

Stockage **JSON persistant sur disque** (un fichier par collection dans `DATA_DIR`), sans dépendance native — donc compatible Termux. Collections : `users`, `groups`, `group_members`, `admins`, `group_settings`, `warnings`, `bot_settings`, `stats`, `contact_messages`.

`group_members` est spécifique à la version Telegram : elle retient les membres vus écrire dans chaque groupe, pour pallier le fait que l'API Bot Telegram ne permet pas de lister tous les membres (voir [§14](#14-limitations-propres-à-telegram)).

L'architecture (classe `Collection` avec une interface `get/set/delete/all`) a été pensée pour permettre une migration future vers PostgreSQL sans réécrire la logique métier.

## 10. Déploiement sur Render

1. Poussez le projet sur un dépôt Git.
2. Créez un nouveau **Web Service** Render, ou utilisez directement `render.yaml` (Blueprint).
3. Renseignez au minimum `BOT_TOKEN` et `OWNER_ID` dans les variables d'environnement Render (elles sont marquées `sync: false` dans `render.yaml`, donc à saisir manuellement dans le tableau de bord).
4. Déployez. `npm install` puis `npm start` sont exécutés automatiquement. Le bot se connecte immédiatement (pas de code d'appairage à récupérer, contrairement à WhatsApp).

⚠️ Le plan gratuit Render utilise un **système de fichiers éphémère** : la base JSON sera perdue à chaque redéploiement/veille, sauf si vous attachez un **Persistent Disk** (voir le bloc commenté dans `render.yaml`). Le `BOT_TOKEN` lui-même n'est pas concerné : il reste valide indéfiniment (stocké uniquement dans les variables d'environnement Render), donc aucune reconnexion manuelle n'est jamais nécessaire.

## 11. Liste des commandes

La liste complète et à jour est toujours disponible via `/help` (ou `/help <catégorie>`) directement dans Telegram — elle reflète exactement les commandes chargées par le bot. Catégories : `general`, `ai`, `image`, `video`, `audio`, `download`, `tools`, `group`, `moderation`, `fun`, `owner`.

## 12. Configuration des groupes

Chaque groupe a ses propres réglages, stockés indépendamment (`group_settings`) :

```
/antilink on|off|whitelist <lien>
/antispam on|off
/antibadword on|off|add <mot>|list
/antiflood on|off
/antinsfw on|off
/welcome on|off|set <message avec @user>
/goodbye on|off|set <message avec @user>
/autoread on|off      (sans effet visible sur Telegram, voir §14)
/autotyping on|off
/autorecording on|off
```

Les commandes de modération nécessitent que **H$Λ BOT soit administrateur du groupe**, avec le droit de supprimer des messages et d'exclure des membres (à activer lors de l'ajout du bot au groupe, ou via les paramètres d'administration Telegram).

## 13. Système /contact

- `/contact <message>` : transmet directement le message à OWNER.
- `/contact` (sans texte) : le bot répond *« Envoyez maintenant votre message »*, puis transmet le prochain contenu envoyé (texte, image, audio, vidéo, document).
- OWNER répond en utilisant la fonction **« Répondre »** de Telegram directement sur le message reçu : la réponse est automatiquement retransmise au bon utilisateur.
- La correspondance (`contact_messages`) est **persistante** : OWNER peut répondre même après un redémarrage du bot.
- Chaque conversation est isolée : une réponse à un utilisateur A n'est jamais envoyée à un utilisateur B.
- Rappel : OWNER doit avoir démarré une conversation avec le bot au moins une fois (voir [§7](#7-propriétaire-owner)).

## 14. Limitations propres à Telegram

L'API Bot Telegram est volontairement plus restrictive que l'accès WhatsApp via Baileys, pour des raisons de confidentialité des utilisateurs. Ce projet le documente honnêtement plutôt que de simuler des fonctionnalités impossibles :

| Fonctionnalité | Limitation | Comportement de H$Λ BOT |
|---|---|---|
| `/add` | Un bot ne peut pas ajouter un membre à un groupe | Génère un lien d'invitation à la place |
| `/block`, `/unblock` | Un bot ne peut pas bloquer un compte Telegram | Redirige vers `/ban` / `/unban` (blocage applicatif) |
| `/tagall`, `/hidetag` | L'API Bot ne permet pas de lister tous les membres d'un groupe | Mentionne les membres déjà vus écrire par le bot (registre `group_members`) |
| `/autoread` | Les bots n'ont pas accès aux accusés de lecture | Le réglage est stocké mais sans effet visible |
| `/videostatus` | Pas d'équivalent au "Statut" WhatsApp | Publie sur un canal Telegram configuré (`STATUS_CHANNEL_ID`) à la place |
| `/groupinfo`, `/tagadmins` | Seuls les administrateurs sont listables via l'API Bot | Fonctionnent normalement (portent uniquement sur les admins) |

## 15. Dépannage

| Problème | Piste |
|---|---|
| Le bot ne répond à rien dans un groupe | Vérifiez que le mode confidentialité est désactivé (`/setprivacy` sur @BotFather) et que le bot est bien membre du groupe |
| `/contact` ou `/report` échoue avec "propriétaire non configuré/joignable" | OWNER doit envoyer un premier message au bot (voir [§7](#7-propriétaire-owner)) |
| Données perdues à chaque redéploiement Render | Attachez un Persistent Disk pour `DATA_DIR` (voir [§10](#10-déploiement-sur-render)) — le `BOT_TOKEN` lui n'est jamais perdu |
| Commandes vidéo/audio/sticker en erreur | Installez `ffmpeg` (`pkg install ffmpeg` sur Termux, `apt install ffmpeg` sur Linux) ou définissez `FFMPEG_PATH` |
| Une commande IA répond "non configuré" | Renseignez `AI_API_KEY` dans `.env` |
| Le bot ne répond à aucun message privé | Vérifiez que vos messages commencent bien par le préfixe actuel (`/help` pour le voir) |
| Erreur de permission (kick/promote...) | H$Λ BOT doit être administrateur du groupe, avec les droits correspondants |

## 16. Sécurité

- Vérification des permissions **OWNER / ADMIN / USER** faite côté serveur à chaque commande (jamais confiée au client).
- `/eval` et `/exec` sont strictement réservées à OWNER et ne sont jamais exposées à un utilisateur normal.
- Aucun `eval()` n'est utilisé pour la calculatrice (`/calc`) : un évaluateur d'expressions dédié est utilisé.
- Anti-spam interne configurable (`RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS`) pour limiter les abus et protéger les API externes.
- Les logs ne contiennent jamais de clés API, tokens ou `BOT_TOKEN` (filtrage automatique).
- Toute commande peut échouer sans jamais faire planter le processus (gestion d'erreurs systématique + messages clairs).

---

**H$Λ BOT** — Multifunction Telegram Bot, 100% gratuit.
