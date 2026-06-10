// =========================================================
// api/lead.js — пример безопасного приёма заявок
// =========================================================
// Положите этот файл в /api/lead.js (Vercel) или адаптируйте
// под Netlify Functions / Cloudflare Workers / Node.js + Express.
//
// На фронтенде в script.js укажите:
//   window.SINGA = { endpoint: '/api/lead', ... };
//
// Переменные окружения (НЕ коммитьте их в git!):
//   TELEGRAM_BOT_TOKEN — токен бота от @BotFather
//   TELEGRAM_CHAT_ID   — chat_id, куда слать заявки
// =========================================================

const RATE = new Map(); // простейший антифлуд по IP в памяти процесса

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const data = req.body || {};

    // 1) honeypot — если заполнено поле "company", это бот
    if (data.company) return res.status(200).json({ ok: true });

    // 2) обязательное поле — телефон, минимум 11 цифр
    const digits = String(data.phone || '').replace(/\D/g, '');
    if (digits.length !== 11) {
      return res.status(400).json({ ok: false, error: 'Bad phone' });
    }

    // 3) длина текстовых полей — защита от мусора
    const cut = (s, n) => String(s || '').slice(0, n).replace(/[\u0000-\u001F\u007F]+/g, ' ');
    const lead = {
      source:   cut(data.source, 80),
      name:     cut(data.name, 60),
      phone:    cut(data.phone, 24),
      topic:    cut(data.topic, 80),
      problem:  cut(data.problem, 120),
      address:  cut(data.address, 60),
      comment:  cut(data.comment, 400),
    };

    // 4) антифлуд: одно сообщение в 10 секунд с IP
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const last = RATE.get(ip) || 0;
    if (Date.now() - last < 10_000) {
      return res.status(429).json({ ok: false, error: 'Too many requests' });
    }
    RATE.set(ip, Date.now());

    // 5) собираем сообщение и отправляем в Telegram
    const text =
      `🔧 Заявка с сайта «Синга Сервис»\n` +
      `Источник: ${lead.source || '—'}\n` +
      `Имя: ${lead.name || '—'}\n` +
      `Телефон: ${lead.phone}\n` +
      `Техника: ${lead.topic || '—'}\n` +
      (lead.problem ? `Проблема: ${lead.problem}\n` : '') +
      (lead.address ? `Адрес точки: ${lead.address}\n` : '') +
      (lead.comment ? `Комментарий: ${lead.comment}\n` : '') +
      `IP: ${ip}`;

    const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT  = process.env.TELEGRAM_CHAT_ID;
    if (!TOKEN || !CHAT) {
      console.error('TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы');
      return res.status(500).json({ ok: false, error: 'Server is not configured' });
    }

    const tg = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: CHAT, text, disable_web_page_preview: true }),
    });

    if (!tg.ok) {
      const body = await tg.text();
      console.error('Telegram error:', tg.status, body);
      return res.status(502).json({ ok: false, error: 'Telegram delivery failed' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Lead handler error:', err);
    return res.status(500).json({ ok: false, error: 'Internal error' });
  }
}
