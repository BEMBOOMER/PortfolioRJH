// One-off: get a Google refresh token for the booking API.
// Run locally (never deployed):
//   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node scripts/google-calendar-token.mjs
// Sign in with the Google account whose calendar should receive the bookings,
// then copy the printed refresh token into Vercel as GOOGLE_REFRESH_TOKEN.
import http from 'node:http';
import { exec } from 'node:child_process';

const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret } = process.env;
if (!id || !secret) {
  console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET first.');
  process.exit(1);
}

const PORT = 53682;
const redirect = `http://127.0.0.1:${PORT}/callback`;
const scope = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/calendar.freebusy'].join(' ');
const auth = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
  client_id: id, redirect_uri: redirect, response_type: 'code', scope, access_type: 'offline', prompt: 'consent',
})}`;

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname !== '/callback') return res.end();
  const code = url.searchParams.get('code');
  if (!code) { res.end('No code, try again.'); return; }
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: 'authorization_code' }),
  });
  const j = await r.json();
  res.end(j.refresh_token ? 'Done, you can close this tab and go back to the terminal.' : 'No refresh token received, see terminal.');
  console.log(j.refresh_token ? `\nGOOGLE_REFRESH_TOKEN=${j.refresh_token}\n` : j);
  server.close();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Opening Google sign-in...\nIf nothing opens, visit:\n' + auth);
  exec(`open "${auth}"`);
});
