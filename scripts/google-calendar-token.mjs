// One-off: get a Google refresh token for the booking API.
// Run locally (never deployed):
//   node scripts/google-calendar-token.mjs ~/Downloads/client_secret_....json
// Sign in with the Google account whose calendar should receive the bookings,
// then copy the printed refresh token into Vercel as GOOGLE_REFRESH_TOKEN.
import http from 'node:http';
import { exec, execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// Either pass the client JSON that Google lets you download, or set the env vars.
let { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret } = process.env;
if (process.argv[2]) {
  const j = JSON.parse(readFileSync(process.argv[2], 'utf8'));
  const c = j.installed || j.web || j;
  id = c.client_id;
  secret = c.client_secret;
}
if (!id || !secret) {
  console.error('Usage: node scripts/google-calendar-token.mjs ~/Downloads/client_secret_....json');
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
  if (j.refresh_token) {
    // put a ready-to-paste .env block on the clipboard instead of printing secrets;
    // Vercel splits it into three variables when pasted into the Key field
    const block = `GOOGLE_CLIENT_ID=${id}\nGOOGLE_CLIENT_SECRET=${secret}\nGOOGLE_REFRESH_TOKEN=${j.refresh_token}\n`;
    try {
      execSync('pbcopy', { input: block });
      console.log('\nGelukt. De drie regels staan op je klembord: plak ze (cmd+V) in het Key-veld in Vercel.\n');
    } catch {
      console.log(`\nPaste this into Vercel > Settings > Environment Variables:\n\n${block}`);
    }
  } else {
    console.log('Geen refresh token ontvangen:', j.error || j);
  }
  server.close();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Opening Google sign-in...\nIf nothing opens, visit:\n' + auth);
  exec(`open "${auth}"`);
});
