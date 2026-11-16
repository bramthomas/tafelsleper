# Arbeidstafel

Een losstaand Hulpmiddel (één HTML-bestand, geen server of internetverbinding nodig) om de
arbeidstafel op te stellen en aan te passen.

Open `arbeidstafel.html` in een browser. Alles wordt automatisch opgeslagen in de browser
(`localStorage`), dus uw werk blijft bewaard als u het bestand sluit.

## Werking

### 1. Opzetmodus — eerst de lege tabel definiëren
Klik bovenaan op **🛠 Opzetmodus: datums definiëren**. In deze modus:

- voegt u met **➕ Datum toevoegen** nieuwe datumregels toe;
- vult u per datum **Feestdag** en **Vakantie** in (Datum is een echte datumnotatie);
- kunt u datums sorteren (**⬍ Sorteer op datum**) of verwijderen (🗑).

Klik daarna op **📋 Terug naar planning** om te gaan puzzelen.

### 2. Planningsmodus — rijen verslepen
In de planningsmodus:

- sleept u een rij (via het ⠿-teken of de rij zelf) naar een andere datum. De kolommen
  **Datum, Feestdag en Vakantie blijven staan**; enkel de planning (Arbeid, Inleider, Graad,
  MV, Status, Opmerkingen, Voorhof, WP) schuift mee. Staat er al iets op de doeldatum, dan
  wisselen de twee rijen van planning.
- zijn de kolommen **Graad, MV, Status, Voorhof en WP** dropdownmenu's. De opties beheert u
  via **⚙ Opties beheren** (toevoegen/verwijderen van opties voor elke lijst). De overige
  kolommen zijn vrije tekst.

### 3. Parkeerplaats
Onderaan de tabel staat de **parkeerplaats** voor uitgevallen, ongeplande of onbesloten
evenementen. Sleep een rij uit de tafel naar dit vak om ze te parkeren; sleep een geparkeerde
rij terug op een datum om ze in te plannen (een eventuele bestaande planning op die datum
verhuist dan mee naar de parkeerplaats). Met 🗑 verwijdert u een geparkeerde rij definitief.

### 4. Voorbeelddata
Met **Voorbeelddata laden** zet u de tafel terug naar het voorbeeld (januari 2026).

## Toekomstige uitbreidingen (nog niet ingebouwd)

- Export naar Excel (twee versies).
- Koppeling met Deck in Nextcloud.

De data zit in één JSON-structuur in `localStorage` (sleutel `arbeidstafel-v1`), wat deze
uitbreidingen later eenvoudig maakt.
