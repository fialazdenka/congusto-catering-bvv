# Con Gusto Catering — landing page „Catering na BVV“

Statická landing page pro vystavovatele na Brněnském výstavišti (BVV).
Čisté **HTML5 + CSS3 + vanilla JS**, bez frameworků a bez build procesu.
Nasazení = nahrát soubory na libovolný webserver.

## Obsah projektu

```
index.html         # celá stránka
vercel.json        # hosting: bezpečnostní hlavičky, cache, noindex
robots.txt         # zatím Disallow (před spuštěním)
css/style.css      # styly (barvy jsou CSS proměnné na začátku souboru)
js/main.js         # navigace, animace, validace + odeslání formuláře
assets/img/        # fotografie
assets/logo/       # loga + favicon (SVG)
assets/fonts/      # firemní display font ConGusto
podklady/          # zdrojové brandové materiály (NEnahrávat na web)
CLAUDE.md          # podrobná projektová/technická dokumentace
DEPLOY.md          # hosting, DNS, bezpečnost, checklist pro spuštění
```

## Jak spustit lokálně

```bash
cd "Catering na BVV"
python3 -m http.server 8000
```
Pak otevřít **http://localhost:8000/**
(Neotevírat přes `file://` — kvůli fontu a relativním cestám je potřeba HTTP.)

## Nasazení do produkce

Hostováno na **Vercelu**, projekt `congusto-catering-bvv`, cílová doména
**`bvv.congustocatering.cz`**. Push do `main` = automatický produkční deploy,
z terminálu `npx vercel --prod`.

Stránka je zatím **soukromá a neindexovaná** (Vercel Authentication + `noindex`).

> Kompletní provozní návod — deploy, DNS pro IT, bezpečnostní hlavičky
> a checklist pro spuštění naostro — je v **`DEPLOY.md`**.

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
Nastavena na `https://bvv.congustocatering.cz/` (`canonical`, `og:url`, `og:image`
v `<head>`). Při změně domény upravit všechny tři.

### Odkaz na zpracování osobních údajů
Na 2 místech je `href="#"` (souhlas u formuláře + patička) — doplňte reálný odkaz.

## Před spuštěním zkontrolujte
1. DNS záznam pro `bvv.congustocatering.cz` je nastavený (viz `DEPLOY.md`).
2. Formulář je napojený na reálný endpoint (+ server-side validace/anti-spam/CSRF).
3. Doplněný odkaz na zpracování osobních údajů.
4. Povolená indexace — `noindex` je na **třech** místech (`vercel.json`, `index.html`,
   `robots.txt`), viz `DEPLOY.md` → „Spuštění naostro“.
5. Analytika/consent: stránka záměrně neobsahuje trackery — vložte je až po vyřešení
   consent managementu (viz `CLAUDE.md` → Privacy).

> Bezpečnostní hlavičky včetně CSP jsou nastavené ve `vercel.json`. CSP je přísná:
> **žádné inline `style="…"` ani inline `<script>`** — prohlížeč by je zablokoval.

## Barvy značky
Definované jako CSS proměnné v horní části `css/style.css`:
purpurová `#4b0041`, zlatá `#cdaa69`, černá `#0f0f0f`, krémová `#faf7f2`.

Podrobná dokumentace: **`CLAUDE.md`**.
