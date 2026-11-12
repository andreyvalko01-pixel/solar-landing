// Vercel serverless function: POST /api/lead
// Змінні оточення: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID

const TYPES = { grid: 'мережева', hybrid: 'гібридна' };

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function buildMessage({ name, phone, calc, page }) {
  const lines = [
    '☀️ <b>Нова заявка з сайту</b>',
    `Ім'я: ${escapeHtml(name) || '—'}`,
    `Телефон: ${escapeHtml(phone)}`,
  ];

  if (calc) {
    lines.push(
      '',
      '<b>Калькулятор:</b>',
      `Споживання: ${Number(calc.consumption)} кВт·год/міс`,
      `Станція: ${Number(calc.power)} кВт, ${TYPES[calc.type] || '—'}`,
      `Сума: ≈ ${Number(calc.cost).toLocaleString('uk-UA')} грн`
    );
  }
  if (page) lines.push('', escapeHtml(page));
  return lines.join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  if (!/^\+380\d{9}$/.test(body.phone || '')) {
    return res.status(422).json({ error: 'Invalid phone' });
  }

  const tgRes = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: buildMessage(body),
      parse_mode: 'HTML',
    }),
  });

  if (!tgRes.ok) {
    console.error('Telegram:', await tgRes.text());
    return res.status(502).json({ error: 'Telegram error' });
  }
  return res.status(200).json({ ok: true });
}
