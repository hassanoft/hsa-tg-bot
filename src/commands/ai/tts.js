import { textToSpeech, isTtsConfigured } from '../../services/ai.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'tts',
  aliases: [],
  category: 'ai',
  description: 'Convertit un texte en message vocal (synthèse vocale).',
  async execute(ctx) {
    if (!isTtsConfigured()) {
      await ctx.reply(errorMessage("La synthèse vocale n'est pas configurée (TTS_API_URL / TTS_API_KEY manquantes)."));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}tts <texte à lire>`);
      return;
    }
    const result = await textToSpeech(ctx.text);
    if (!result.ok) {
      await ctx.reply(errorMessage('Échec de la synthèse vocale.'));
      return;
    }
    await ctx.bot.sendMessage(ctx.chatId, { audio: result.buffer, mimetype: 'audio/mp4', ptt: true }, { quoted: ctx.msg });
  },
};
