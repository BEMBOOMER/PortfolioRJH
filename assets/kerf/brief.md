# Kerf: brief voor de portfolio

## One-liner

Kerf is een lichte notch-app voor macOS die de zwarte rand bovenin je MacBook laat werken: muziek, een shelf voor bestanden, AirDrop, je batterij en een eigen HUD voor volume en helderheid.

## Wat het is

Kerf maakt van de notch van de MacBook een kleine, levende strook. Speelt er muziek, dan staan hoesje en balkjes ernaast; sleep je een bestand naar boven, dan kun je het bewaren of meteen AirDroppen; druk je op een volumetoets, dan verschijnt er een rustig balkje in plaats van de pop-up van macOS. In rust zie je niks: zwart op zwart.

Ik bouwde Kerf als vervanger van Boring Notch, met een kleinere scope en strenge eisen aan gewicht. De app is kleiner dan 2 MB, gebruikt rond de 60 MB geheugen (met de muziek-helper erbij) en in rust 0% CPU. Kerf is gebouwd op 29 september 2026; dezelfde dag volgden de releases 1.1 tot en met 1.3, met een eigen updater, het logo en een volumeschuif.

Het merk volgt dezelfde gedachte als de app: één snede die de notch volgt. De productsite gebruikt die snede als lime lijn onder de kopbalk, en alle schermbeelden komen uit de app zelf.

## Functies

- **Muziek**: speelt er iets in Spotify, Muziek of de browser, dan staan hoesje en bewegende balkjes naast de notch, in de kleur van de hoes.
- **Doorspoelen**: in de open notch sleep je over de voortgangsbalk, met vorige, pauze, volgende en een volumeschuif direct eronder.
- **Skippen met een swipe**: twee vingers opzij over de notch, naar links is het volgende nummer en naar rechts het vorige.
- **Openen en sluiten**: wijzen of klikken opent de notch, twee vingers omlaag of omhoog werkt ook, en muis weg is weer dicht.
- **Shelf**: bestanden die je naar de notch sleept blijven klaarstaan als verwijzing, zonder kopie en zonder extra schijfruimte.
- **AirDrop**: iets op het AirDrop-vak laten vallen stuurt het meteen, en één klik op de tegel stuurt de hele shelf.
- **Batterij**: lader erin geeft een batterijtje dat groen volloopt, en bij 20 en 10 procent verschijnt een korte rode melding.
- **Volume en helderheid**: een eigen balkje onder de notch vervangt de pop-up van macOS, met dezelfde 16 stappen en fijne stapjes via Shift en Option.
- **Nieuw nummer**: bij elk nieuw nummer staan titel en artiest even onder de notch, daarna is het weer stil.
- **Updates**: Kerf kijkt ongeveer één keer per dag of er een nieuwe versie is en installeert die pas als je zelf klikt.

## Denkwijze

- **Kleiner dan het origineel**: ik gebruikte Boring Notch, maar wilde alleen wat ik echt elke dag aanraak. Agenda, webcam-spiegel, timers en een Dock-icoon gingen er bewust uit. Elke functie moest haar plek in die 185 bij 32 punten verdienen.
- **Licht als eis**: de grenzen stonden vooraf vast: een kleine app, rond de 60 MB geheugen en in rust vrijwel 0% CPU. Daarom bewaart de shelf alleen verwijzingen, laten de balkjes zich door Core Animation tekenen en leest Kerf het sleep-klembord pas als een sleepactie de notch echt bereikt.
- **Nooit in de weg**: een notch-app zit op de drukste plek van je scherm. Menubalk-iconen naast de notch en titelbalken eronder blijven klikbaar, een browsertab langs de bovenkant slepen opent niets, en snel langs de notch bewegen laat hem dicht.
- **Eerlijk over rechten**: Toegankelijkheid is alleen nodig voor de HUD, en zonder die toestemming werkt de rest gewoon. De updater vraagt eerst en controleert controlesom, bundle-id, versie en handtekening voordat hij iets wisselt.

## Merk

- **Naam**: kerf is het Engelse woord voor de snede die een zaag achterlaat, de smalle spleet in het hout.
- **Logo-concept**: concept "Naad" in de kleurweg Nacht. Eén zaagsnede volgt de notch dwars door de tegel: bovenin de zwarte notch, in de snede valt licht en daaronder speelt het geluid in vijf balkjes. De tegel is meteen het app-icoon en is bewust vlak gehouden, omdat macOS 26 zelf een glazen rand en schaduw toevoegt. Voor 16 tot 32 px is er een eigen versie met een bredere snede en drie balkjes.
- **Palet**:
  - Notch `#0B0B0D`: de notch, de schermrand
  - Nacht `#232329`: het scherm eronder
  - Snede `#CCFF00`: het licht in de snede, het hoofdaccent
  - Koraal `#FF4F81`, Oranje `#FF6B35`, Geel `#FFD600`, Lime `#CCFF00`, Teal `#06D6A0`: de vijf balkjes, altijd van warm naar koel, van links naar rechts
  - Papier `#F5F0E8`: lichte achtergrond, woordmerk op donker
- **Typografie**: Space Grotesk SemiBold in kleine letters voor het woordmerk, omgezet naar vormen; begeleidende tekst en de productsite ook in Space Grotesk. In de app zelf het systeemfont van macOS, zodat Kerf voelt als een deel van het systeem.
- **Toon**: kort, Nederlands en een beetje droog: "Kerf draait. Wijs naar de notch." en "Er speelt niks". Geen uitroeptekens, geen verkooppraat.
- **Regels**: geen schaduwen, verlopen of gloed op het teken (de snede is al het licht), de balkjes nooit van volgorde wisselen, en op donker altijd de versie met de dunne lichte rand.

## Techniek

- **Swift en SwiftPM**: een Swift-package zonder Xcode-project, gebouwd met één script dat de app samenstelt en ondertekent.
- **AppKit met SwiftUI**: een randloos paneel boven de menubalk met SwiftUI erin; het paneel verandert nooit van grootte, alleen de zwarte vorm animeert.
- **KerfCore**: alle pure logica (afspeelpositie, accentkleur, shelf, batterij, notch-geometrie, updates) zit los van de interface en is gedekt met unit tests.
- **Media-helper**: sinds macOS 15.4 krijgen gewone apps geen Now Playing-info meer, dus praat een kleine Objective-C-helper via de door Apple ondertekende `/usr/bin/perl` met JSON-regels met de app.
- **Core Animation**: de visualizer-balkjes draaien in de render server van macOS en kosten Kerf daardoor vrijwel geen CPU.
- **IOKit, CoreAudio en DisplayServices**: batterij, volume en helderheid komen rechtstreeks uit het systeem, zonder extra rechten.
- **GitHub Releases als updatekanaal**: de code staat in een privé repo, de releases in een publieke, en de app controleert elke download met een SHA-256 uit de release-notities.
- **Snapshot-route**: een debugfunctie rendert elke toestand van de echte views naar PNG, ook met het scherm op slot; zo zijn de screens hieronder gemaakt.

## Feiten

| | |
|---|---|
| Versie | 1.3 |
| macOS | 14 en nieuwer, Apple silicon |
| Gebouwd | 29 september 2026 |
| Grootte | 1,9 MB app, 0,6 MB download |

## Links

- Download (nieuwste versie): https://github.com/BEMBOOMER/kerf-releases/releases/latest
- Alle releases en release-notities: https://github.com/BEMBOOMER/kerf-releases/releases
- Productsite (lokaal, nog niet online): `~/Desktop/Bemboe/Coding & Design/Coding/kerf-site/index.html`
- Code: privé repo `BEMBOOMER/kerf` (niet openbaar)

## Screens

Alle app-beelden zijn gerenderd uit de echte SwiftUI-views van Kerf, met voorbeeldinhoud: het nummer "Avondrood" van "Naad" en de hoes zijn verzonnen, de shelf bevat Kerfs eigen logobladen, en batterij (86%) en volume (62%) zijn vaste voorbeeldwaarden.

- `thumb.jpg`: de kop van de productsite, met de lime snede die bovenin de notch volgt en de vijf balkjes als enige decoratie. Eén zin en één knop: meer heeft de eerste indruk niet nodig.
- `icon.png`: het app-icoon op het macOS-raster. Notch, snede en geluid in één tegel, vlak gehouden zodat macOS er zelf glas en schaduw overheen kan leggen.
- `site-full.jpg`: de hele productsite op 1440 px breed, van kop tot voet. Eén lange, rustige pagina in de kleur Nacht, met de snede als terugkerende lijn.
- `site-01-hero.jpg`: kop en hero. De kopbalk is de notch: een zwarte rand met een uitsparing, en de lime lijn eronder is de snede uit het logo. Daaronder hangt de echte open notch in een donker scherm.
- `site-02-functies.jpg`: negen functies, elk in één zin, met een gekleurd balkje uit het logo als markering. Daaronder drie getallen die laten zien hoe licht de app is.
- `site-03-schermen.jpg`: de toestanden van de notch naast elkaar, van slepen tot laden. Elk beeld hangt aan de bovenrand, zoals de notch op je scherm, zodat je ziet hoe weinig ruimte Kerf echt inneemt.
- `site-04-installeren.jpg`: de installatie in vier stappen, eerlijk over de ad-hoc handtekening en de Toegankelijkheid-vraag. Liever vooraf uitleggen dan dat iemand vastloopt op een melding van macOS.
- `site-05-download.jpg`: het downloadblok met versie, datum en wat er nieuw is. Het icoon staat hier in de versie met de dunne lichte rand, zodat de zwarte notch niet wegvalt op zwart.
- `site-06-over.jpg`: over de maker en de naam. Kerf betekent snede, en dat verhaal staat naast het symbool zelf.
- `app-01-open.png`: de open notch, met speler en volume links en shelf en AirDrop rechts. Alles wat je dagelijks aanraakt staat in één rij van 620 punten breed, en de voortgangsbalk neemt de kleur van de hoes over.
- `app-02-music.png`: de dichte notch terwijl er muziek speelt: hoesje links, vier balkjes rechts. De vorm wordt maar 42 punten per kant breder, net genoeg om te laten zien dat er iets speelt.
- `app-03-nieuw-nummer.png`: een nieuw nummer verschijnt kort onder de notch, met titel en artiest die apart afkappen. Na een paar seconden schuift de vorm weer terug.
- `app-04-slepen.png`: twee dropvakken zodra je iets naar de notch sleept: bewaren of meteen versturen. De vakken tellen mee als je meerdere bestanden tegelijk sleept.
- `app-05-volume-hud.png`: de eigen volume-HUD onder de notch, in plaats van de pop-up midden in beeld. Zelfde 16 stappen als macOS, maar op de plek waar je toch al kijkt.
- `app-06-laden.png`: lader erin: een batterijtje met bliksem loopt groen vol tot het percentage. Drie seconden zichtbaar en dan weer weg.
