import { initCalculator } from './calculator.js';
import { initLeadForm } from './lead-form.js';
import { initAnimations } from './animations.js';

let lastCalc = null;

initCalculator((result) => {
  lastCalc = result;
});

// у заявку додаємо, що людина порахувала в калькуляторі — менеджеру простіше
initLeadForm(() => lastCalc && {
  consumption: lastCalc.consumption,
  type: lastCalc.type,
  region: lastCalc.region,
  power: lastCalc.power,
  cost: Math.round(lastCalc.cost),
});

document.getElementById('calc-to-lead').addEventListener('click', () => {
  const note = document.getElementById('lead-calc');
  note.hidden = false;
  note.textContent = `Ваш розрахунок: станція ${lastCalc.power} кВт, ≈ ${Math.round(lastCalc.cost).toLocaleString('uk-UA')} грн. Інженер перевірить його на місці.`;
});

// тінь у шапки при прокрутці
const header = document.querySelector('.header');
window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', scrollY > 20), { passive: true });

document.getElementById('year').textContent = new Date().getFullYear();

initAnimations();
