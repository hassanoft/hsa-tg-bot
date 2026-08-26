import { errorMessage } from '../../utils/formatter.js';

const LENGTH = { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, ft: 0.3048, in: 0.0254, yd: 0.9144 };
const WEIGHT = { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, t: 1000 };

function convertTemp(value, from, to) {
  let celsius;
  if (from === 'c') celsius = value;
  else if (from === 'f') celsius = (value - 32) * (5 / 9);
  else if (from === 'k') celsius = value - 273.15;
  else throw new Error('unit');

  if (to === 'c') return celsius;
  if (to === 'f') return celsius * (9 / 5) + 32;
  if (to === 'k') return celsius + 273.15;
  throw new Error('unit');
}

export default {
  name: 'convert',
  aliases: [],
  category: 'tools',
  description: 'Convertit une unité. Usage : /convert <valeur> <unité_de> <unité_vers> (longueur, poids, température)',
  async execute(ctx) {
    const [valueRaw, from, to] = ctx.args;
    const value = Number(valueRaw);
    if (Number.isNaN(value) || !from || !to) {
      await ctx.reply(`❌ Utilisation : ${ctx.prefix}convert <valeur> <unité_de> <unité_vers>\nEx: /convert 10 km mi | /convert 5 kg lb | /convert 100 c f`);
      return;
    }
    const f = from.toLowerCase();
    const t = to.toLowerCase();

    try {
      if (['c', 'f', 'k'].includes(f) && ['c', 'f', 'k'].includes(t)) {
        await ctx.reply(`🌡️ ${value}${f.toUpperCase()} = ${convertTemp(value, f, t).toFixed(2)}${t.toUpperCase()}`);
        return;
      }
      if (LENGTH[f] && LENGTH[t]) {
        const result = (value * LENGTH[f]) / LENGTH[t];
        await ctx.reply(`📏 ${value} ${f} = ${result.toFixed(4)} ${t}`);
        return;
      }
      if (WEIGHT[f] && WEIGHT[t]) {
        const result = (value * WEIGHT[f]) / WEIGHT[t];
        await ctx.reply(`⚖️ ${value} ${f} = ${result.toFixed(4)} ${t}`);
        return;
      }
      throw new Error('unit');
    } catch {
      await ctx.reply(errorMessage('Unités non reconnues ou incompatibles.'));
    }
  },
};
