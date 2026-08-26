import { config } from '../../config.js';
import { errorMessage } from '../../utils/formatter.js';

export default {
  name: 'weather',
  aliases: ['meteo'],
  category: 'tools',
  description: 'Affiche la météo actuelle d\'une ville. Usage : /weather <ville>',
  async execute(ctx) {
    if (!config.weather.apiKey) {
      await ctx.reply(errorMessage('Cette fonctionnalité nécessite WEATHER_API_KEY dans .env.'));
      return;
    }
    if (!ctx.text) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}weather <ville>`);
      return;
    }
    try {
      const url = new URL(config.weather.apiUrl);
      url.searchParams.set('q', ctx.text);
      url.searchParams.set('appid', config.weather.apiKey);
      url.searchParams.set('units', 'metric');
      url.searchParams.set('lang', 'fr');
      const res = await fetch(url);
      if (!res.ok) {
        await ctx.reply(errorMessage('Ville introuvable ou service indisponible.'));
        return;
      }
      const data = await res.json();
      await ctx.reply(
        `🌤️ Météo à ${data.name}\n\n` +
        `🌡️ Température : ${data.main.temp}°C (ressenti ${data.main.feels_like}°C)\n` +
        `☁️ Conditions : ${data.weather[0].description}\n` +
        `💧 Humidité : ${data.main.humidity}%\n` +
        `💨 Vent : ${data.wind.speed} m/s`
      );
    } catch {
      await ctx.reply(errorMessage('Échec de la récupération de la météo.'));
    }
  },
};
