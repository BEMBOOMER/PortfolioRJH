// GET /api/slots?type=kennismaking&from=2026-10-01&to=2026-10-31
// → { days: { "2026-10-12": ["09:30", ...] }, rules: {...} }
const cal = require('./_calendar');

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!cal.configured()) return res.status(503).json({ error: 'not_configured' });

  const { type = 'kennismaking' } = req.query;
  let { from, to } = req.query;
  if (!cal.TYPES[type]) return res.status(400).json({ error: 'bad_type' });
  if (!cal.isDate(from)) from = cal.todayLocal();
  if (!cal.isDate(to) || to < from) to = cal.addDays(from, 31);
  if (to > cal.addDays(from, 62)) to = cal.addDays(from, 62);

  try {
    const days = await cal.availability(from, to, type);
    res.status(200).json({ days, minutes: cal.TYPES[type].minutes, lastDay: cal.addDays(cal.todayLocal(), cal.RULES.maxDaysAhead) });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'calendar_unreachable' });
  }
};
