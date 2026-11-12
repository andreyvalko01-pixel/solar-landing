// Розрахунок окупності. Цифри середні по ринку на 2026 рік,
// їх легко поправити тут, не чіпаючи решту коду.

// Скільки кВт·год за рік дає 1 кВт панелей у регіоні
const YIELD_PER_KW = {
  north: 1080,
  center: 1150,
  west: 1100,
  south: 1320,
};

// Вартість під ключ за 1 кВт, грн
const PRICE_PER_KW = {
  grid: 26000,
  hybrid: 38000,
};

const BATTERY_PRICE = 55000; // акумулятор ~10 кВт·год для гібриду
const MIN_POWER = 3;
const MAX_POWER = 30;

export function calculate({ consumption, tariff, type, region }) {
  const yearlyConsumption = consumption * 12;
  const perKw = YIELD_PER_KW[region];

  // підбираємо потужність так, щоб покрити річне споживання, з кроком 0.5 кВт
  let power = Math.ceil((yearlyConsumption / perKw) * 2) / 2;
  power = Math.min(Math.max(power, MIN_POWER), MAX_POWER);

  const yearlyYield = Math.round(power * perKw);
  const cost = power * PRICE_PER_KW[type] + (type === 'hybrid' ? BATTERY_PRICE : 0);

  // економимо лише ту енергію, яку дім реально спожив би з мережі
  const saving = Math.min(yearlyYield, yearlyConsumption) * tariff;
  const payback = saving > 0 ? cost / saving : Infinity;

  return { power, yearlyYield, cost, saving, payback };
}

const money = (n) => `${Math.round(n).toLocaleString('uk-UA')} грн`;

function formatYears(value) {
  if (!Number.isFinite(value)) return '—';
  const years = Math.round(value * 10) / 10;
  return `${years.toLocaleString('uk-UA')} ${years < 5 && years % 1 === 0 && years > 1 ? 'роки' : 'років'}`;
}

export function initCalculator(onChange) {
  const form = document.getElementById('calc-form');
  const out = (id) => document.getElementById(id);

  function update() {
    const data = {
      consumption: Number(form.consumption.value),
      tariff: Number(form.tariff.value),
      type: form.type.value,
      region: form.region.value,
    };
    const r = calculate(data);

    out('out-consumption').textContent = data.consumption;
    out('out-tariff').textContent = data.tariff.toFixed(2).replace('.', ',');

    out('res-power').textContent = `${r.power.toLocaleString('uk-UA')} кВт`;
    out('res-cost').textContent = money(r.cost);
    out('res-yield').textContent = `${r.yearlyYield.toLocaleString('uk-UA')} кВт·год`;
    out('res-saving').textContent = money(r.saving);
    out('res-payback').textContent = formatYears(r.payback);
    out('res-bar').style.width = `${Math.min((r.payback / 25) * 100, 100)}%`;

    onChange?.({ ...data, ...r });
  }

  form.addEventListener('input', update);
  update();
}
