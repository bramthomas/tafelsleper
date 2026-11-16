<?php
// Kopieer dit bestand naar config.php en vul de waarden in.
// config.php staat in .gitignore en wordt dus nooit meegecommit.

// MariaDB-verbinding (zie db/schema.sql)
define('DB_DSN', 'mysql:host=127.0.0.1;dbname=tafelsleper;charset=utf8mb4');
define('DB_USER', 'tafelsleper');
define('DB_PASS', 'vervang-dit-wachtwoord');

// Optioneel: zet hier een geheim token. De app stuurt dan header X-Api-Token mee
// (vul dezelfde waarde in bij API_TOKEN in arbeidstafel.html).
// Leeg laten = alleen same-origin toegang (veilig zat voor intern gebruik).
define('API_TOKEN', '');

// Optioneel CORS: bv. 'https://jouw-domein.nl' als de app op een andere origin draait
// dan api.php (bijv. bij de latere Nextcloud-koppeling). Leeg = geen CORS-headers.
define('CORS_ORIGIN', '');
