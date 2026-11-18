# Arbeidstafel

Een losstaand hulpmiddel (één HTML-bestand, geen server of internetverbinding nodig) om de
arbeidstafel op te stellen en aan te passen.

Open `arbeidstafel.html` in een browser. Alles wordt automatisch opgeslagen in de browser
(`localStorage`), dus uw werk blijft bewaard als u het bestand sluit.

## Werking

### 1. Opzetmodus — eerst de lege tabel definiëren
Klik bovenaan op **🛠 Opzetmodus: datums definiëren**. In deze modus:

- voegt u met **➕ Datum toevoegen** nieuwe datumregels toe;
- met **🗓️ Datums in reeks aanmaken** maakt u in één keer een hele reeks lege datums aan
  (handig aan het begin van een werkjaar): kies de **eerste en laatste dag** van de periode,
  een **interval** (wekelijks, om de 2, 3 of 4 weken) en de **dag van de week** waarop de
  standaardbijeenkomst valt (standaard **maandag**). Bestaande datums worden niet
  overschreven; Feestdag en Vakantie worden nadien automatisch opgezocht;
- vult u per datum **Feestdag** en **Vakantie** in — bij het invoeren of wijzigen van een datum
  worden deze **automatisch opgezocht** en ingevuld (zie onder "Automatisch opzoeken");
- kunt u datums sorteren (**⬍ Sorteer op datum**) of verwijderen (🗑).

Klik daarna op **📋 Terug naar planning** om te gaan puzzelen.

### 2. Planningsmodus — rijen verslepen
In de planningsmodus:

- sleept u een rij (via het ⠿-teken of de rij zelf) naar een andere datum. De kolommen
  **Datum, Feestdag en Vakantie blijven staan**; enkel de planning (Arbeid, Inleider, Graad,
  MV, Status, Opmerkingen, Voorhof, WP) schuift mee. Staat er al iets op de doeldatum, dan
  wisselen de twee rijen van planning.
- zijn de kolommen **Graad, MV, Status, Voorhof en WP** dropdownmenu's. De opties beheert u
  via **⚙ Opties beheren**. De overige kolommen zijn vrije tekst.
- heeft elke rij een **🗑 verwijderknop** (met bevestiging) waarmee u de hele regel
  (datum + planning) verwijdert.

### 3. Parkeerplaats
Onderaan de tabel staat de **parkeerplaats** voor uitgevallen, ongeplande of onbesloten
evenementen. Met **➕ Nieuwe regel** voegt u makkelijk een nieuwe regel toe; zodra u een
**datum** invoert of aanpast, worden **Feestdag** en **Vakantie automatisch opgezocht**.
Sleep een rij uit de tafel naar dit vak om ze te parkeren; sleep een geparkeerde rij terug op
een datum om ze in te plannen (heeft de geparkeerde rij dezelfde datum, dan worden Feestdag
en Vakantie meegenomen; een eventuele bestaande planning op die datum verhuist naar de
parkeerplaats). Met 🗑 verwijdert u een geparkeerde rij definitief.

Sleep een geparkeerde rij naar de **stippelzone onderaan de tafel** (⬇) om ze daar als
**nieuwe regel onderaan toe te voegen** — met de datum, Feestdag en Vakantie van de
geparkeerde rij, zonder een bestaande rij te verdringen.

### 4. Automatisch opzoeken van feestdag en vakantie
Bij elke ingevoerde datum (in de opzetmodus én in de parkeerplaats) zoekt het systeem op:

- **Feestdag**: Nederlandse feestdagen (Nieuwjaar, Goede Vrijdag, Pasen, Koningsdag,
  Bevrijdingsdag, Hemelvaart, Pinksteren, Kerst — berekend incl. paasdata) én Joodse
  feestdagen (Rosh Hasjana, Jom Kipoer, Soekot, Pesach, Sjav'oeot, Poerim, Chanoeka, … —
  berekend via de Hebreeuwse kalender). Beide soorten kunnen aan/uit in de instellingen.
- **Vakantie**: de schoolvakanties worden **live opgehaald van de website van het ministerie
  van OCW (rijksoverheid.nl)**, per schooljaar en per regio, en lokaal gecachet. In
  **🛠 Instellingen** kiest u de regio (**standaard Regio Midden**: Noord/Midden/Zuid) en kunt
  u de vakanties handmatig verversen (**Nu ophalen van rijksoverheid.nl**). Werkt live ophalen
  niet (bijvoorbeeld bij openen als los bestand zonder server, door CORS, of offline), dan
  gebruikt de app een ingebouwde kopie van de huidige schooljaren.

### 5. Voorbeelddata
Met **Voorbeelddata laden** zet u de tafel terug naar het voorbeeld (januari 2026).

## Opslag in MariaDB (optioneel)

Standaard bewaart de app alles in de browser (`localStorage`). Wilt u de tafel centraal
opslaan in een **MariaDB**, dan draait u de bestanden op een webserver met PHP + MariaDB:

1. Maak de database en tabel aan: `mysql -u root -p < db/schema.sql`
   (past `db/schema.sql` aan als u andere databasenaam/gebruiker/wachtwoord wilt).
2. Kopieer `config.example.php` naar `config.php` en vul de MariaDB-gegevens in
   (`config.php` staat in `.gitignore` en wordt nooit meegecommit).
   Zet optioneel een `API_TOKEN` (de app stuurt dan header `X-Api-Token` mee; vul dezelfde
   waarde in bij `API_TOKEN` in `arbeidstafel.html`).
3. Zet `arbeidstafel.html`, `api.php` en `config.php` op uw webhost (bijv. in een
   submap naast Nextcloud) en open `arbeidstafel.html` via de webserver.

De app synchroniseert dan automatisch (gedepiest, 600 ms na elke wijziging) naar MariaDB
via `api.php` (`GET ?action=get` bij het openen, `POST ?action=save` bij wijzigingen) en
houdt tegelijk een lokale kopie in `localStorage` als fallback. In **🛠 Instellingen** ziet u
de opslagstatus. Werkt `api.php` niet (bijv. bestand direct geopend via `file://`), dan
valt de app automatisch terug op alleen lokale opslag.

## Ontwikkeling / CI

- `test/smoke-test.js` checkt de JavaScript in `arbeidstafel.html` (syntax + logica:
  kalenders, feestdagen, vakantie-parser, sleep-gedrag): `node test/smoke-test.js`
- `.github/workflows/ci.yml` draait deze test automatisch bij elke push/PR.

## Toekomstige uitbreidingen (nog niet ingebouwd)

- Export naar Excel (twee versies).
- Koppeling met Deck in Nextcloud.

De data zit in één JSON-structuur in `localStorage` (sleutel `arbeidstafel-v1`), wat deze
uitbreidingen later eenvoudig maakt.
