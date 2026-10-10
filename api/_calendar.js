/*
 * Shared booking logic for /api/slots and /api/book.
 * Talks to the Google Calendar REST API with an OAuth refresh token, so it
 * needs no npm packages. Files starting with "_" are not exposed as routes.
 *
 * Env (Vercel → Settings → Environment Variables):
 *   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 *   GOOGLE_CALENDAR_ID   optional, defaults to "primary"
 *   BOOKING_MOCK=1       local testing only: fake calendar, nothing is written
 */

const TZ = 'Europe/Amsterdam';

// When people can book: weekdays, local time.
const RULES = {
  days: [1, 2, 3, 4, 5],        // Mon to Fri
  open: '09:30',
  close: '17:00',
  step: 30,                     // minutes between possible start times
  buffer: 15,                   // free minutes around existing events
  minNoticeHours: 12,
  maxDaysAhead: 42,
};

const TYPES = {
  kennismaking: { label: 'Kennismaking', minutes: 30, video: true },
  bellen:       { label: 'Belafspraak',  minutes: 15, video: false },
  sessie:       { label: 'Projectsessie', minutes: 60, video: true },
};

const MOCK = process.env.BOOKING_MOCK === '1';

function configured() {
  return MOCK || Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}

/* ── time zones without a library ───────────────────────── */

// Minutes that TZ is ahead of UTC at the given instant.
function tzOffset(date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(date).map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - Math.floor(date.getTime() / 1000) * 1000) / 60000);
}

// Local wall-clock time in TZ → Date (instant).
function zoned(dateStr, timeStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let t = guess - tzOffset(new Date(guess)) * 60000;
  t = guess - tzOffset(new Date(t)) * 60000; // second pass settles DST edges
  return new Date(t);
}

function todayLocal() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date());
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function weekday(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toTime = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);

/* ── Google ─────────────────────────────────────────────── */

let token = null;

async function accessToken() {
  if (token && token.exp > Date.now() + 60000) return token.value;
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });
  if (!res.ok) throw new Error(`token ${res.status}`);
  const j = await res.json();
  token = { value: j.access_token, exp: Date.now() + j.expires_in * 1000 };
  return token.value;
}

const calendarId = () => process.env.GOOGLE_CALENDAR_ID || 'primary';

async function google(path, init = {}) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
  });
  if (!res.ok) throw new Error(`calendar ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function busyBetween(from, to) {
  if (MOCK) {
    // a fake meeting every weekday from 11:00 to 12:30
    const out = [];
    for (let d = from.toISOString().slice(0, 10); zoned(d, '00:00') < to; d = addDays(d, 1)) {
      out.push({ start: zoned(d, '11:00'), end: zoned(d, '12:30') });
    }
    return out;
  }
  const j = await google('/freeBusy', {
    method: 'POST',
    body: JSON.stringify({ timeMin: from.toISOString(), timeMax: to.toISOString(), timeZone: TZ, items: [{ id: calendarId() }] }),
  });
  const cal = j.calendars[calendarId()] || Object.values(j.calendars)[0];
  return (cal.busy || []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

/* ── availability ───────────────────────────────────────── */

// { "2026-10-12": ["09:30", "10:00", ...], ... } for every bookable day in [from, to].
async function availability(fromStr, toStr, typeKey) {
  const type = TYPES[typeKey];
  const first = todayLocal();
  const last = addDays(first, RULES.maxDaysAhead);
  if (fromStr < first) fromStr = first;
  if (toStr > last) toStr = last;
  if (fromStr > toStr) return {};

  const busy = await busyBetween(zoned(fromStr, '00:00'), zoned(addDays(toStr, 1), '00:00'));
  const earliest = Date.now() + RULES.minNoticeHours * 3600000;
  const pad = RULES.buffer * 60000;
  const days = {};

  for (let d = fromStr; d <= toStr; d = addDays(d, 1)) {
    if (!RULES.days.includes(weekday(d))) continue;
    const slots = [];
    for (let m = toMin(RULES.open); m + type.minutes <= toMin(RULES.close); m += RULES.step) {
      const start = zoned(d, toTime(m));
      const end = new Date(start.getTime() + type.minutes * 60000);
      if (start.getTime() < earliest) continue;
      const clash = busy.some((b) => start.getTime() < b.end.getTime() + pad && end.getTime() > b.start.getTime() - pad);
      if (!clash) slots.push(toTime(m));
    }
    if (slots.length) days[d] = slots;
  }
  return days;
}

async function createEvent({ typeKey, date, time, name, email, company, topic, message, phone }) {
  const type = TYPES[typeKey];
  const start = zoned(date, time);
  const end = new Date(start.getTime() + type.minutes * 60000);

  const lines = ['Ingepland via roelofjuniorhaar.marketing', '', `Naam: ${name}`, `E-mail: ${email}`];
  if (company) lines.push(`Bedrijf: ${company}`);
  if (phone) lines.push(`Telefoon: ${phone}`);
  if (topic) lines.push(`Onderwerp: ${topic}`);
  if (message) lines.push('', message);

  const event = {
    summary: `${type.label} met ${name}${company ? ` (${company})` : ''}`,
    description: lines.join('\n'),
    start: { dateTime: start.toISOString(), timeZone: TZ },
    end: { dateTime: end.toISOString(), timeZone: TZ },
    attendees: [{ email, displayName: name }],
    reminders: { useDefault: true },
  };
  if (type.video) {
    event.conferenceData = { createRequest: { requestId: `rjh-${start.getTime()}-${Math.random().toString(36).slice(2, 8)}`, conferenceSolutionKey: { type: 'hangoutsMeet' } } };
  } else if (phone) {
    event.location = `Roelof belt ${phone}`;
  }

  if (MOCK) return { id: 'mock', hangoutLink: type.video ? 'https://meet.google.com/mock-link' : undefined, start: start.toISOString() };

  const q = new URLSearchParams({ sendUpdates: 'all', conferenceDataVersion: type.video ? '1' : '0' });
  const created = await google(`/calendars/${encodeURIComponent(calendarId())}/events?${q}`, { method: 'POST', body: JSON.stringify(event) });
  return { id: created.id, hangoutLink: created.hangoutLink, start: start.toISOString() };
}

module.exports = { TYPES, RULES, configured, availability, createEvent, isDate, addDays, todayLocal };
