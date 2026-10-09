# Planner koppelen aan Google Agenda

De sectie "Plan direct een gesprek" op de homepage praat met twee Vercel-functies
(`api/slots.js`, `api/book.js`). Die hebben drie geheime waarden nodig. Zolang die
ontbreken toont de site een nette melding met je mailadres.

## 1. Google Cloud (eenmalig, ~10 min)
1. Ga naar console.cloud.google.com, maak een project (bijv. "Portfolio planner").
2. APIs & Services > Library: zet **Google Calendar API** aan.
3. APIs & Services > OAuth consent screen: type **External**, vul app-naam en je mail in.
   Voeg jezelf toe als test user. Zet daarna de status op **In production**
   (anders verloopt je token na 7 dagen). Google toont bij het inloggen een
   "niet geverifieerd"-waarschuwing: dat is normaal voor eigen gebruik, klik door.
4. APIs & Services > Credentials > Create credentials > **OAuth client ID**,
   type **Desktop app**. Kopieer Client ID en Client secret.

## 2. Refresh token ophalen (lokaal)
In de map van de portfolio:

    GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy node scripts/google-calendar-token.mjs

Log in met het account van de agenda waar afspraken in moeten (bemooks@gmail.com
of bemboe09@gmail.com). De terminal print `GOOGLE_REFRESH_TOKEN=...`.

## 3. In Vercel zetten
Project > Settings > Environment Variables (Production en Preview):
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- optioneel `GOOGLE_CALENDAR_ID` (standaard je hoofdagenda, "primary")

Daarna opnieuw deployen (Deployments > Redeploy).

## Regels aanpassen
In `api/_calendar.js` bovenaan: werkdagen, 09:30 tot 17:00, 15 min buffer rond
bestaande afspraken, minimaal 12 uur vooruit, maximaal 6 weken vooruit.
Gesprekstypes en duur staan in `TYPES` (ook in `initBooking` in script.js).
