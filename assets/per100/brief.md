# PER100, brief voor de portfolio

Bronnen: de repo BEMBOOMER/per100 (branch claude/eager-cori-f1m8zn, commit 7fc585f, de laatste testversie), docs/concept.md, docs/huisstijl.md, de pull requests #1 tot en met #4 en Roelofs ontwerpen in design/referentie/. Alles hieronder komt daaruit.

## One-liner

Een calorie- en eiwittracker die onder elk getal zet waar het vandaan komt, en verder niets van je vindt.

## Wat het is

PER100 is een app waarin je bijhoudt wat je eet. Je scant een product, zoekt het op of typt gewoon wat je at, en ziet calorieën, eiwit en de rest van het etiket. Onder elk getal staat waar het vandaan komt: van het etiket, ingevuld door gebruikers van Open Food Facts, of uit een voedingstabel. Rekent of schat de app zelf iets, dan staat dat er ook bij.

Ik maakte PER100 als examenproject Mediavormgeving, met Upfront als opdrachtgever: het sportvoedingsmerk uit Rotterdam dat alles wat je moet weten op de voorkant van de verpakking zet. PER100 doet dat voor alles wat je eet. De app heeft wel een eigen gezicht, niet de huisstijl van Upfront.

Naast het ontwerp is er een werkende testversie voor Android: scannen, zoeken in ruim 11.000 producten, typen wat je at, een agenda, een weektabel en vitamines en mineralen, alles opgeslagen op de telefoon zelf.

## Functies

- **Scan**: de barcode scannen, of een foto van het etiket maken en de telefoon de voedingswaarde laten lezen.
- **Zoek**: op naam zoeken in ruim 11.000 producten uit voedingstabellen, ook zonder verbinding, en online in Open Food Facts.
- **Typ wat je at**: een zin als "2 boterhammen met kaas en een glas melk" wordt een maaltijd, met elke standaardmaat als schatting gemarkeerd.
- **Bron bij elk getal**: onder elk getal één woord in blauw, en op één tik de uitleg en de som als het berekend is.
- **Je eerste getal**: bij de start kies je wat groot op Thuis staat: proteïne, calorieën, koolhydraten, vet of ingrediënten.
- **Agenda**: elke dag terugkijken, aanvullen of vooruit plannen, en een regel of een hele dag verplaatsen of kopiëren, met ongedaan maken.
- **Week**: zeven dagen als tabel, met het gemiddelde van alleen de dagen die je bijhield.
- **Vitamines en mineralen**: negentien stoffen per product en per dag, met het percentage van de referentie-inname zoals op een etiket.
- **Dagetiket**: je hele dag als één voedingswaardetabel, om te delen als afbeelding.
- **Licht en donker**: elk scherm in allebei, en op Android ook het app-icoon op je beginscherm.

## Denkwijze

**Een getal zonder bron is een gok**: in mijn enquête onder 24 mensen scoorde de bron van een getal een 4,2 van 5, en het vertrouwen in de cijfers van hun huidige app een 3,0. Daarom is de USP iets wat je ziet in plaats van leest: een blauw woord onder elk getal, uitleg op één tik.

**Ontworpen voor wie gevoelig is voor cijfers**: geen rood en geen groen, geen reeksen of badges, alleen een neutrale telling als "5 van de 7 dagen bijgehouden". Een doel bestaat alleen als je het zelf invult en wordt nooit uit je gewicht berekend. Wat voor die gebruiker veilig is, is voor de rest gewoon rustig.

**Camera eerst, moeite eruit**: van de mensen die stopten met bijhouden, deden 9 van de 12 dat door de moeite, niet door gebrek aan motivatie. Dus staan barcode en etiket voorop, is zoeken de uitweg, en kun je typen zoals je praat.

**Wat bewust niet**: geen verplicht account, geen server, geen analytics, geen gewichtslog of streefgewicht en geen gezondheidsclaims. En geen Upfront-huisstijl: PER100 kreeg vier eigen kleuren, eigen letters en een eigen iconenset.

## Merk

- **Naam**: PER100, uitgesproken als "per honderd": de eenheid van elk etiket, waar de voedingswaarde per 100 gram of 100 milliliter staat. Slogan: Je ziet wat je eet.
- **Logo en icoon**: mijn eigen ontwerp in twee vormen. Het woordmerk zet PER100 in een vlak, met "by Upfront" eronder. Het app-logo stapelt PER boven 100 op een tegel. In beide zitten schuine teal strepen in de nullen. Het app-icoon is afgeleid van het app-logo, in een lichte en een donkere variant.
- **Palet**: vier kleuren, niet meer.
  - Zilver Wit `#E8EFF5`: kalm, het papier van het etiket. Achtergrond in licht.
  - Kool Zwart `#312F2F`: feit, wat er staat, staat er. Tekst en het grote getal.
  - Neutraal Teal `#2EEFCE`: geen goed, geen slecht, het enige dat oplicht. Altijd tegen zwart, nooit op wit.
  - Bron Blauw `#0B6699`: weten, alles wat blauw is kun je nakijken. In donker `#5BAEE0`.
  - Rood en groen bestaan niet in deze app.
- **Typografie**: Impact voor alles wat groot en zwaar is (het getal, titels, tegels, het woordmerk), in de app en op de site tijdelijk vervangen door Anton omdat de Impact-licentie via Monotype loopt. JetBrains Mono voor de rest: labels in kapitalen met ruime spatiëring, waarden, uitleg en de bronregel. Altijd tabelcijfers.
- **Beeldtaal**: één groot getal is het beeld, de tabel is de lay-out (hairlines, kolommen, rechts uitgelijnde getallen), 31 eigen lijn-iconen van 3 pt, en de schuine strepen als terugkerend teken. Donker is een omkering, geen tweede ontwerp.
- **Toon**: de wijze in gewone taal. Nuchter, Nederlands, kort. Labels van één woord met een punt (Proteïne.), een lege regel zegt eerlijk "Staat niet op de verpakking", nooit gezond, dieet, afvallen of limiet, en geen uitroeptekens.

## Techniek

- Expo SDK 57, React Native 0.86, TypeScript strict, Expo Router met de schermen als bestanden.
- Opslag op het toestel met expo-sqlite (met migraties); per getal de bron, de berekening, waaruit en wanneer. Op web valt de app terug op localStorage.
- State met Zustand. Geen server, geen account, geen analytics; Android-back-up van de appdata staat uit.
- Camera met expo-camera voor barcodes (EAN-13, EAN-8, UPC-A, UPC-E, controlecijfer nagekeken); etiket lezen met ML Kit (expo-mlkit-ocr) op de telefoon, plus een eigen etiketlezer voor Nederlandse, Belgische, Duitse en Engelse tabellen.
- Data in de app: Ciqual 2025 van ANSES (3.484 voedingsmiddelen), USDA FoodData Central SR Legacy en Foundation (8.070), 321 Upfront-producten uit Open Food Facts, en 288 Nederlandse namen voor gewone producten. Online: Open Food Facts. NEVO zit er nog niet in.
- Rekenen volgens EU 1169/2011: kJ en kcal, energie uit de voedingsstoffen, zout uit natrium en de referentie-innames voor 19 vitamines en mineralen.
- Laatste testronde (draft PR #4): foto van je bord via een eigen Expo-module met ML Kit, Dagetiket als PNG (react-native-view-shot) en een Android-widget (react-native-android-widget).
- Anton en JetBrains Mono via @expo-google-fonts; de 31 iconen als eigen PNG-set.
- Testversie als APK via GitHub Actions; tests met Jest (185 tests in 13 suites volgens PR #4).
- Gebouwd in vier rondes met Claude Code, naar mijn concept, huisstijl en schermroute; ik testte de APK op mijn telefoon en stuurde per ronde bij.
- Productsite: statische HTML, CSS en een klein script, zonder framework, met de letters lokaal. Eén hero, de naam, drie uitgelichte schermen, een korte lijst, met bron, privacy en over.

## Feiten

- Project | Eindexamen Mediavormgeving 2026/2027
- Voor | Upfront, sportvoeding uit Rotterdam
- Rol | Onderzoek, concept, huisstijl, logo, iconen en schermen
- Status | Testversie op Android

## Links

- Productsite (lokaal, nog niet online): `~/Desktop/Bemboe/Coding & Design/Coding/per100-site/index.html`
- Instagram: https://instagram.com/bemooks
- Repo: github.com/BEMBOOMER/per100 (privé, niet linken)
- Databronnen: https://world.openfoodfacts.org · https://ciqual.anses.fr · https://fdc.nal.usda.gov

## Screens

- `site-full.jpg`: de hele productsite op 1440 px breed. Rustig opgebouwd: één hero, de naam, drie uitgelichte schermen, een korte lijst, de bron, privacy en wie het maakte.
- `site-01-hero.jpg`: de slogan Je ziet wat je eet. groot in Anton, met één echt scherm ernaast: Thuis met 1.090 kcal en de bronregel eronder.
- `site-02-naam.jpg`: de naam uitgelegd op Kool Zwart. PER100, uitgesproken als per honderd, de eenheid van elk etiket, naast het app-logo met de teal strepen in de nullen.
- `site-03-de-bron-staat-eronder.jpg`: het productscherm groot naast één alinea. De belofte van de app in één beeld: onder elk getal het bronwoord in blauw.
- `site-04-typ-wat-je-at.jpg`: een gewone zin wordt een maaltijd. Het scherm staat hier rechts, zodat de pagina afwisselt zonder drukker te worden.
- `site-05-je-dag-als-etiket.jpg`: het Dagetiket, de dag als voedingswaardetabel. Het idee achter de naam in één scherm.
- `site-06-en-verder.jpg`: de overige functies als korte lijst in twee kolommen, elk met een eigen lijn-icoon uit de app.
- `site-07-met-bron.jpg`: het donkere vlak met de schuine strepen, zoals het getalvlak in de app. De vijf bronwoorden in Bron Blauw en de databronnen in gewone taal.
- `site-08-privacy.jpg`: alles blijft op de telefoon, in drie punten, en eerlijk over wat ML Kit van Google doet.
- `site-09-over.jpg`: wie het maakte, met het donkere app-icoon, en de colofon met de regel dat dit geen officiële app van Upfront is.
- `app-01-thuis.png`: Thuis. Eén groot getal is het beeld: 1.090 kcal op het donkere getalvlak, eiwit en koolhydraten kleiner ernaast, en de bronregel in Bron Blauw eronder. Zoek en Scan als twee grote tegels.
- `app-02-product.png`: een product als etikettabel. Per 100 gram en per 250 gram naast elkaar, rechts uitgelijnde tabelcijfers, en onder elke regel de bron.
- `app-03-bron-van-een-getal.png`: de bron van één getal, op één tik. Het getal groot, het bronwoord in blauw en in gewone taal waar het vandaan komt, tot de naam in de tabel aan toe.
- `app-04-typ-wat-je-at.png`: een gewone zin wordt een maaltijd. Elk onderdeel opgezocht, elke standaardmaat gemarkeerd als schatting, en alles na te kijken voor je toevoegt.
- `app-05-dagetiket.png`: de dag als voedingswaardetabel, onder het woordmerk en de schuine strepen. Het idee achter de naam in één scherm.
- `app-06-thuis-donker.png`: Thuis in donker. Een omkering, geen tweede ontwerp: Zilver Wit en Kool Zwart wisselen, het getalvlak wordt wit en de Scan-tegel helemaal teal.
- `icon.png`: het app-icoon, 512 px. Het gestapelde app-logo op Zilver Wit.
- `icon-donker.png`: de donkere variant van het icoon, op Android te kiezen in Weergave.
- `thumb.jpg`: uitsnede van de hero van de productsite, 1600 x 1000, voor de portfoliokaart.
