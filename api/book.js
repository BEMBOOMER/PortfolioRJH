// POST /api/book  { type, date, time, name, email, company?, phone?, topic?, message?, website (honeypot) }
// Re-checks the slot, then creates the event; Google mails the invite to the guest.
const cal = require('./_calendar');

const clean = (v, max) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '');
const cleanText = (v, max) => (typeof v === 'string' ? v.replace(/\r/g, '').trim().slice(0, max) : '');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!cal.configured()) return res.status(503).json({ error: 'not_configured' });

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

  // bots fill in the hidden field; pretend it worked
  if (body.website) return res.status(200).json({ ok: true });

  const input = {
    typeKey: clean(body.type, 20),
    date: clean(body.date, 10),
    time: clean(body.time, 5),
    name: clean(body.name, 80),
    email: clean(body.email, 120),
    company: clean(body.company, 80),
    phone: clean(body.phone, 30),
    topic: clean(body.topic, 60),
    message: cleanText(body.message, 1500),
  };

  if (!cal.TYPES[input.typeKey] || !cal.isDate(input.date) || !/^\d{2}:\d{2}$/.test(input.time)) {
    return res.status(400).json({ error: 'bad_slot' });
  }
  if (!input.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return res.status(400).json({ error: 'bad_contact' });
  }
  if (input.typeKey === 'bellen' && !/^[+0-9 ()-]{8,}$/.test(input.phone)) {
    return res.status(400).json({ error: 'bad_phone' });
  }

  try {
    const days = await cal.availability(input.date, input.date, input.typeKey);
    if (!(days[input.date] || []).includes(input.time)) return res.status(409).json({ error: 'taken' });
    const ev = await cal.createEvent(input);
    res.status(200).json({ ok: true, start: ev.start, meet: ev.hangoutLink || null });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'calendar_unreachable' });
  }
};
