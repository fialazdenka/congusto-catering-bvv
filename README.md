# Con Gusto Catering — landing page „Catering na BVV“

Statická landing page pro vystavovatele na Brněnském výstavišti (BVV).
Čisté **HTML5 + CSS3 + vanilla JS**, bez frameworků a bez build procesu.
Nasazení = nahrát soubory na libovolný webserver.

## Obsah projektu

```
index.html         # celá stránka
css/style.css      # styly (barvy jsou CSS proměnné na začátku souboru)
js/main.js         # navigace, animace, validace + odeslání formuláře
assets/img/        # fotografie
assets/logo/       # loga + favicon (SVG)
assets/fonts/      # firemní display font ConGusto
podklady/          # zdrojové brandové materiály (NEnahrávat na web)
CLAUDE.md          # podrobná projektová/technická dokumentace
```

## Jak spustit lokálně

```bash
cd "Catering na BVV"
python3 -m http.server 8000
```
Pak otevřít **http://localhost:8000/**
(Neotevírat přes `file://` — kvůli fontu a relativním cestám je potřeba HTTP.)

## Nasazení do produkce

Nahrajte na server obsah kořenové složky **kromě `podklady/`** (zdrojové materiály)
a kromě `CLAUDE.md` / `README.md` (nepovinné). Tedy: `index.html`, `css/`, `js/`, `assets/`.

## Co je potřeba upravit

### Texty
Veškerý text je přímo v `index.html` (česky). Sekce jsou přehledně okomentované
(`<!-- HERO -->`, `<!-- NABÍDKA -->`, `<!-- POPTÁVKA -->` …).

### Kontakty
Telefon a e-mail jsou na dvou místech — v poptávkové sekci a v patičce.
Hledejte v `index.html`:
- `+420770148148` (v `href="tel:…"`) a zobrazené `+420 770 148 148`
- `catering@congusto.cz` (v `href="mailto:…"`)

### Napojení formuláře (důležité)
Formulář zatím **neodesílá data** — odeslání pouze simuluje na frontendu.
V `js/main.js` najděte komentář **`TODO(IT): Production form endpoint`** a nahraďte
simulaci reálným voláním (vzor `fetch()` je přímo v komentáři). Připravená je i
alternativa přes `action`/`method` na `<form>`.

Pole formuláře (`name`): `jmeno, firma, email, telefon, veletrh, datum, stanek,
osoby, zajem[] , poznamka, souhlas`. Skryté pole `web` je **honeypot** proti spamu —
je-li vyplněné, poptávku zahoďte.

> Server musí provést vlastní **validaci a sanitizaci** vstupu, **anti-spam**
> (rate limiting / CAPTCHA) a **CSRF** ochranu. Frontendová validace je jen UX.

### Produkční URL
V `<head>` souboru `index.html` nahraďte `PLACEHOLDER-DOMENA.cz` skutečnou doménou
(3× — `canonical`, `og:url`, `og:image`).

### Odkaz na zpracování osobních údajů
Na 2 místech je `href="#"` (souhlas u formuláře + patička) — doplňte reálný odkaz.

## Před spuštěním zkontrolujte
1. Formulář je napojený na reálný endpoint (+ server-side validace/anti-spam/CSRF).
2. Doplněný odkaz na zpracování osobních údajů.
3. Nastavená produkční URL (canonical + Open Graph).
4. HTTP security hlavičky na webserveru (návrh CSP a dalších v `CLAUDE.md` → sekce Security).
5. Analytika/consent: stránka záměrně neobsahuje trackery — vložte je až po vyřešení
   consent managementu (viz `CLAUDE.md` → Privacy).

## Barvy značky
Definované jako CSS proměnné v horní části `css/style.css`:
purpurová `#4b0041`, zlatá `#cdaa69`, černá `#0f0f0f`, krémová `#faf7f2`.

Podrobná dokumentace: **`CLAUDE.md`**.
