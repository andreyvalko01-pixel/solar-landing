// Форма заявки. Дані йдуть на /api/lead (serverless-функція), а вона вже пише менеджеру в Telegram.

const PHONE_RE = /^\+?380\d{9}$/;

function normalizePhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = '38' + digits;
  return '+' + digits;
}

export function initLeadForm(getCalcSummary) {
  const form = document.getElementById('lead-form');
  const status = document.getElementById('lead-status');
  const button = form.querySelector('button');

  const setStatus = (text, type = '') => {
    status.textContent = text;
    status.className = `lead__status ${type}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // приховане поле заповнюють тільки боти
    if (form.website.value) return;

    const phone = normalizePhone(form.phone.value);
    form.phone.classList.toggle('is-invalid', !PHONE_RE.test(phone));
    if (!PHONE_RE.test(phone)) {
      setStatus('Перевірте номер телефону', 'is-error');
      return;
    }

    button.disabled = true;
    setStatus('Надсилаємо…');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.value.trim(),
          phone,
          calc: getCalcSummary(),
          page: location.href,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      form.reset();
      setStatus('Дякуємо! Скоро передзвонимо.', 'is-ok');
    } catch (err) {
      console.error(err);
      setStatus('Не вдалося надіслати. Зателефонуйте нам: 050 333 22 11', 'is-error');
    } finally {
      button.disabled = false;
    }
  });
}
