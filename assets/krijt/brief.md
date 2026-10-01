# KRIJT · brief voor de portfolio-case (App Development)

## One-liner

KRIJT is een logboek voor krachttraining: je schrijft op wat je deed, ziet bij elke set wat je vorige keer deed en gaat er net overheen.

## Wat het is

KRIJT is een Android-app, en een PWA uit dezelfde code, voor wie drie tot vijf keer per week traint, een schema volgt en wil zien of hij sterker wordt. De app doet drie dingen: loggen tijdens de training, plannen per week en terugzien hoe het gaat.

Het beeld erachter is het krijtbord in een oude gym. Bij elke set staat wat je de vorige keer deed, de velden staan al op een voorstel en één tik vinkt een set af en start de rusttimer. Alles staat op je eigen telefoon, zonder account, en werkt ook zonder bereik.

KRIJT staat niet in de Play Store. Je installeert de APK zelf vanaf GitHub, en vanaf versie 0.3.0 meldt een nieuwe versie zich vanzelf in de app. Voor de release is er een eenvoudige productpagina in dezelfde huisstijl.

## Functies

- **Vorige keer erbij**: bij elke set staat als spookwaarde wat je de vorige sessie deed, zonder dat je iets hoeft op te zoeken.
- **Voorstel voor de volgende set**: de velden staan vooringevuld met een rep meer, of met het volgende gewicht als je vorige keer overal je maximum haalde.
- **Eigen numpad**: kilo's en reps tik je in op een numpad onderin het scherm, met min en plus in de stap van de oefening.
- **Rusttimer**: start vanzelf bij het afvinken, met −15, +15 en Skip, en stuurt een melding als de app tijdens de rust op de achtergrond staat.
- **Records**: alle vier de recordsoorten worden per oefening bijgehouden, maar alleen een nieuw zwaarste gewicht op een hoofdoefening krijgt het turfteken.
- **Weekplanning**: schema's op dagen zetten, verslepen met lang indrukken en een week herhalen voor de komende vier weken.
- **Schema's delen en importeren**: als platte tekst via WhatsApp, mail of een .txt, met zes kant-en-klare splits van full body tot bro split.
- **Voortgang**: een tijdlijn van alle sessies, per oefening een grafiek van de geschatte max (e1RM) en het volume, en twee sessies naast elkaar.
- **Lichaamsgewicht**: wegingen als stippen met een 7-daags voortschrijdend gemiddelde als lijn.
- **Lokaal en offline**: alles staat in een database op het toestel, met export en import als JSON en twaalf weken voorbeelddata om eerst rond te kijken.

## Denkwijze

- **Een logboek, geen coach**: Ik wilde een app die opschrijft wat je deed en laat zien wat je de vorige keer deed, meer niet. Het krijtbord in een oude gym is het uitgangspunt: je kijkt wat er staat en je gaat er net overheen.
- **Gemaakt voor tussen twee sets**: Alles werkt met één hand, de belangrijke knoppen zitten onder je duim en de cijfers zijn groot. Een eigen numpad vervangt het systeemtoetsenbord en de velden staan al op een voorstel, zodat een set vaak één tik is.
- **Oranje als signaal**: Signaaloranje komt op hooguit één of twee plekken per scherm: de primaire knop, je volgende set, een record. Daarom telt een record-moment alleen bij een nieuw zwaarste gewicht op een hoofdoefening; met dubbele progressie breek je bijna elke training wel ergens een klein record, en dan zegt oranje niets meer.
- **Bewust niet**: Geen account, geen sync, geen sociale feed, geen AI-coach en geen koppeling met Health of Fit. Geen onboarding van tien schermen, maar twee vragen die je allebei kunt overslaan. Online gaat de app alleen om bij GitHub te vragen of er een nieuwe versie is.

## Merk

- **Naam**: KRIJT, altijd in kapitalen. Krijt van het krijtbord in de gym, waar je opschrijft wat je deed. Richting van de huisstijl: een industrieel logboek, mat, droog en precies, als een technische tekening op krijtwit papier.
- **Logo en icoon**: het turfteken, vier verticale strepen met een vijfde schuin erdoorheen, in een vierkant met afgeronde hoeken (radius 22%). De lijndikte is gelijk aan de stamdikte van Bricolage Grotesque 800. App-icoon: krijtwit op grafiet. Woordmerk KRIJT in Bricolage 800, letterspatiëring -0,02em; in de lockup is de tekst 0,585 keer zo groot als het beeldmerk. Bestand: `icon.png`.
- **Palet (licht)**:
  - Krijtwit `#F3F1EC`: achtergrond
  - Grafiet `#1C1D1F`: tekst, icoon, afgevinkte sets
  - Signaaloranje `#FF4F1A`: primaire actie, records, actieve set
  - Wit `#FFFFFF`: kaarten en sheets
  - Steengrijs `#E8E5DE` (token surface-2): invoervelden, inactieve chips
  - Grijs `#6B6A66` (ink-2): secundaire tekst en labels
  - Spookgrijs `#A9A6A0` (ink-3): spookwaarden, kolom VORIGE
  - Lijn `#D9D5CC`: scheidingslijnen en millimeterpapier
  - Groen `#2F7D4F` en roestrood `#B8452E`: vooruitgang en achteruitgang
  - Donker thema: achtergrond `#141516`, kaarten `#1C1D1F`, tekst `#F3F1EC`, oranje `#FF6A3D`
- **Typografie**: Bricolage Grotesque (600/800) voor koppen, schermtitels en het woordmerk; Figtree (400 tot 600) voor tekst, labels en knoppen; Martian Mono voor alle data: gewichten, reps, datums en grafiekassen, met tabular nums.
- **Vormtaal**: geen schaduwen in licht thema, diepte komt uit 1px lijnen. Radius 14px voor kaarten, 10px voor invoer, 999px voor chips. Millimeterpapier-grid (8px, elke vijfde lijn iets donkerder) achter Voortgang en het startscherm, en een grain-overlay van 3,5% over alles. Lucide-iconen met stroke 1,75.
- **Motion**: afvinken tilt de rij 4px, het vinkje tekent zich in 180ms en het cijfer flitst kort oranje. Een nieuw record laat het turfteken één keer tikken, zonder confetti. Schermwissels 200ms.
- **Toon**: kort, droog, Nederlands, geen uitroeptekens. Uit de app: "Nog niks geschreven. Begin een training.", "Nieuw record. 82,5 kg × 8.", "Rust. 3:00", "Niks gepland. Herstel is ook training." en "Je logboek is nog leeg. Tijd voor de eerste streep."

## Techniek

- Vite, React 18 en TypeScript (strict)
- Tailwind CSS met de huisstijl als CSS-variabelen, licht en donker
- Dexie (IndexedDB) als lokale database; elk record heeft id, updatedAt en deletedAt, zodat sync later kan
- Zustand met persist voor de actieve training en de rusttimer, dus een gesloten app verliest niets
- Recharts, volledig naar de huisstijl gestyled, en date-fns met Nederlandse notatie (82,5 kg, di 14 apr)
- Hash routing met React Router, zodat web, PWA en Android-WebView zich hetzelfde gedragen
- Motion voor animatie, met respect voor prefers-reduced-motion
- @tanstack/react-virtual voor een tijdlijn die ook met honderden sessies vloeiend scrollt
- vite-plugin-pwa voor de installeerbare, offline PWA
- Capacitor 8 voor Android: lokale meldingen, haptics, delen, bestanden en in-app updates via de GitHub Releases API van een publieke releases-repo
- Iconen en splash worden met sharp uit de turfteken-geometrie gegenereerd
- Vitest voor de rekenlogica (e1RM, records, suggesties), de voorbeelddata, de database en de back-up; CI op GitHub Actions
- Werkwijze: een eigen bouwspec (huisstijl, datamodel, rekenlogica, schermen) als opdracht voor Claude Code, gebouwd in de volgorde van de spec met een commit per stap

## Feiten

- Versie | 0.3.0 (28 sep 2026)
- Platform | Android 7 of nieuwer (APK) + PWA
- Data | lokaal en offline, geen account
- Inhoud | 51 oefeningen, 6 kant-en-klare schema's

## Links

- Download, nieuwste versie: https://github.com/BEMBOOMER/krijt-releases/releases/latest
- Alle versies: https://github.com/BEMBOOMER/krijt-releases/releases
- Productpagina (lokaal, nog niet online): `~/Desktop/Bemboe/Coding & Design/Coding/krijt-site/index.html`
- Instagram: https://instagram.com/bemooks
- Let op: de code-repo BEMBOOMER/krijt is privé, dus niet linken.

## Screens

Alle app-schermen zijn echte screenshots van de webversie van 0.3.0 (390 × 844 op 3x), gevuld met de voorbeelddata die in de app zit. De naam Roelof is in de setup ingevuld; de training is een testsessie op de geplande Push A, niet opgeslagen.

- `thumb.jpg`: Uitsnede van de productpagina: de kop, de downloadknop en de training als technische tekening, met maatlijnen van 390 bij 844.
- `icon.png`: Het app-icoon, 512 px. Het turfteken in krijtwit op grafiet, met dezelfde lijndikte als de stam van de letter.
- `site-full.jpg`: De hele productpagina op 1440 px breed. Eén pagina, opgebouwd als een logboek: per sectie een label, een kop en een liniaal van 1px eronder.
- `site-01-hero.jpg`: De opening. Eén zin over wat KRIJT is, een oranje downloadknop en een oranje punt als enige signalen, en de telefoon uitgemeten als op een tekening.
- `site-02-training.jpg`: Het trainingsscherm als technische tekening, met genummerde verwijzers naar de kolom VORIGE, de oranje streep, het numpad en de knop Klaar.
- `site-03-functies.jpg`: De functies als kasboek: drie kaarten voor loggen, plannen en voortgang, met rechts per regel een voorbeeld in de notatie van de app.
- `site-04-schermen.jpg`: Acht echte schermen op millimeterpapier, van de eerste begroeting tot het donkere thema.
- `site-05-installeren.jpg`: Eerlijk over sideloaden: drie stappen, hoe updates binnenkomen en waarom Android kan waarschuwen.
- `site-06-privacy.jpg`: Lokaal, offline, export en wissen, elk in één zin.
- `site-07-over.jpg`: Wie het maakt, met het icoon en de downloadknop als afsluiter.
- `app-01-training.jpg`: Het belangrijkste scherm. Links in grijs wat je vorige keer deed, de oranje streep wijst je volgende set aan, en een nieuw zwaarste gewicht krijgt het turfteken terwijl de rust aftelt.
- `app-02-vandaag.jpg`: Vandaag laat zien wat er gepland staat, de week als zeven hokjes en de knop Start training in de duimzone. De gestippelde balk zegt eerlijk dat je naar voorbeelddata kijkt.
- `app-03-voortgang.jpg`: Bankdrukken over twaalf weken: de geschatte max als lijn, de zwaarste sets als stippen en een duidelijke dip in de deloadweek. Assen en cijfers in Martian Mono, het grid op millimeterpapier.
- `app-04-plan.jpg`: De week als zeven rijen met de datum in mono en trainingen als chips. Gedane trainingen zijn gevuld grafiet met een vinkje, geplande hebben de tint van hun schema en vandaag heeft een oranje stip.
- `app-05-start.jpg`: De eerste start: twee vragen, allebei over te slaan, en dan dit. Het enige oranje is de punt achter de naam.
- `app-06-donker.jpg`: De tijdlijn in het donkere thema, dat het systeem volgt. Dezelfde rust, met grafiet als achtergrond en krijtwit als tekst.
