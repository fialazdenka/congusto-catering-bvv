# CLAUDE.md — Con Gusto Catering / Landing page BVV

Projektová a technická paměť pro další práci v Claude Code. Držte se jí.

## Project

Jednostránková landing page (`index.html`) pro **Con Gusto Catering**, cílená na
**vystavovatele na Brněnském výstavišti (BVV)**. Prezentuje catering na veletržní
stánek (občerstvení, obchodní schůzky, VIP hosté, tým, večerní akce) a vede
návštěvníka k odeslání nezávazné poptávky.

Cílové skupiny: vystavovatelé na BVV, marketingoví a event manažeři, obchodní
ředitelé, koordinátoři veletržní účasti, vedení firem, agentury připravující expozice.

## Business goal

Primární konverze = **odeslání poptávkového formuláře** (`#poptavka`).
Sekundární cíle: telefonát / e-mail (kontaktní blok).
Hlavní sdělení: *„Na veletrhu se soustřeďte na obchod, gastronomii nechte na nás.“*

## Brand

Vychází z brand manuálu ve složce `podklady/` a z živého webu
`https://www.congustocatering.cz`.

- **Barvy** (definované jako CSS custom properties v `css/style.css`):
  - Purpurová (primární): `#4b0041` → `--purpur`
  - Tmavá purpurová (pozadí): `#33002d` → `--purpur-deep`
  - Zlatá: `#cdaa69` → `--gold` (na světlém pozadí použít `--gold-strong` `#b8934f` kvůli kontrastu)
  - Firemní černá: `#0f0f0f` → `--ink`
  - Krémové neutrály: `--paper` `#faf7f2`, `--paper-2` `#f2ece2`
  - Pozn.: v názvech log značka používá slovo „RED“, ale jde o **purpurovou** `#4b0041`.
- **Typografie:**
  - Body i nadpisy: systémový sans-serif stack (`--ff-body`) — rychlé, bez externího requestu, blízké firemnímu Acumin Pro (Acumin je licenčně placený a NENÍ webově nasazen).
  - Firemní display font **ConGusto** (`assets/fonts/ConGusto-Regular.woff2`) je **pouze minuskový** (nemá verzálky ani plnou diakritiku). Používá se **výhradně** pro dekorativní „eyebrow“ popisky a kickery karet psané malými písmeny (`.eyebrow`, `.card__kicker`). Nepoužívat na běžné nadpisy.
- **Tonalita:** česky, vykání, profesionální, konkrétní, bez korporátní vaty a bez
  neověřených tvrzení. Con Gusto = zkušený gastronomický partner, ne dodavatel „na všechno“.
- **Vizuál:** tmavé prémiové sekce (purpur/černá) střídané s krémovými; velká
  gastronomická fotografie; zlaté akcenty; jemné animace (reveal). Bez AI klišé
  (gradientové bloby, obří radiusy, pill spam, falešné statistiky).

## Architecture

```
/
├─ index.html                 # celá stránka (semantic HTML, jedna URL)
├─ vercel.json                # hosting: bezpečnostní hlavičky, cache, X-Robots-Tag
├─ robots.txt                 # zatím Disallow (stránka před spuštěním)
├─ .vercelignore              # co se NEnahrává na produkci
├─ css/style.css              # veškeré styly, CSS custom properties, breakpointy
├─ js/main.js                 # vanilla JS: nav, sticky header, reveal, validace formuláře
├─ assets/
│  ├─ img/                    # fotografie (hero + sekce)
│  ├─ logo/                   # SVG loga + favicon
│  └─ fonts/                  # ConGusto display font (woff2/woff)
├─ podklady/                  # ZDROJOVÉ brandové materiály (NEDISTRIBUOVAT na web, needitovat)
├─ CLAUDE.md
├─ DEPLOY.md                  # hosting, DNS, bezpečnost, launch checklist
└─ README.md
```

Bez build procesu, bez frameworků, bez závislostí. Čisté HTML5 + CSS3 + vanilla JS.

## Hosting

**Vercel**, projekt `congusto-catering-bvv` (scope `zdenkafiala's projects`, plán Pro),
propojený s GitHub repem `fialazdenka/congusto-catering-bvv` — push do `main` je
automatický produkční deploy, z terminálu `npx vercel --prod`.

Cílová doména: **`bvv.congustocatering.cz`** (přiřazená k projektu, čeká na DNS
záznam u regzone.cz). Dočasná adresa: `congusto-catering-bvv.vercel.app`.

Stránka je před spuštěním **soukromá** (Vercel Authentication na `*.vercel.app`)
a **neindexovaná** na třech místech současně: `X-Robots-Tag` ve `vercel.json`,
`<meta name="robots">` v `index.html` a `Disallow: /` v `robots.txt`.

> Kompletní provozní návod (deploy, DNS pro IT, požadavky na formulářový endpoint,
> launch checklist) je v **`DEPLOY.md`** — při práci s hostingem začínejte tam.

## Assets

Fotografie i loga pocházejí z vlastních brandových materiálů Con Gusto:

- **Loga a font**: složka `podklady/IDENTITY/` (firemní brand manuál). Do `assets/`
  jsou zkopírované jen použité varianty (SVG loga, favicon = firemní štítek, ConGusto font).
- **Fotografie** (`assets/img/`): staženy z veřejného webu `congustocatering.cz`
  jako **lokální kopie** (žádné hotlinkování). Jde o vlastní produktové/eventové
  fotografie značky:
  - `hero.jpg` — tmavá food fotka (banner `main-page.jpg`)
  - `coffee-stand.jpg` — brandovaný Con Gusto catering box (`cb01`)
  - `business-meeting.jpg` — chlebíčky/wrapy (`cb02`)
  - `vip-hospitality.jpg` — dezertní poháry, raut (`galerie/raut/01`)
  - `team-care.jpg` — zeleninový salát (`up01`, menší rozlišení 380 px)
  - `after-fair.jpg` — welcome drink / sekt na Špilberku (`welcome-drink`)
  - `chef-box.jpg` — kuchař s catering boxem (`cb03`)
- **Logo v hlavičce/patičce**: `logo-horizontal-descriptor-white.svg` (bílé, na tmavém pozadí).
  Pro světlé pozadí je k dispozici `logo-horizontal-purpur.svg`.
- **Favicon**: `assets/logo/favicon.svg` = firemní štítek (purpur + zlaté „CG“).

> Pozn.: `team-care.jpg` má nižší rozlišení (380×380). Klient může dodat kvalitnější
> fotku salátu/snídaně týmu a nahradit ji (stejný název souboru).

## Development

Statická stránka — stačí libovolný HTTP server:

```bash
cd "Catering na BVV"
python3 -m http.server 8000
# → http://localhost:8000/
```

(Nespoléhat na `file://` — kvůli fontu a relativním cestám používat HTTP.)

## Content

**Ověřené údaje** (z veřejného webu Con Gusto, srpen 2026):
- Telefon: **+420 770 148 148**
- E-mail: **catering@congusto.cz**
- Provozovny skupiny: Monte Bú, Ristorante Piazza, Pivnice U Čápa, Gelateria Piazza, KOREK Wines
- Reference (veřejně uváděné): ČSOB, Cinema City, Honeywell, Notino, Deichmann,
  Kerry Logistics, VUT v Brně, CEITEC, DPMB, Teplárny Brno, Hvězdárna Brno, CIC

**Musí doplnit / potvrdit klient nebo IT:**
- Fyzická adresa provozovny / fakturační údaje (na stránce záměrně neuvedeny).
- Reálný odkaz na dokument **Zpracování osobních údajů** (nyní placeholder `href="#"`
  na 2 místech: consent u formuláře a patička).
- Potvrdit formulaci „odpověď obvykle do 24 hodin“ (je to interní příslib, ne garance).
- Případně nahradit `team-care.jpg` kvalitnější fotografií.

Reference jsou uvedené jako textové názvy (ne loga) — jde o veřejně prezentované
klienty. Loga třetích stran nebyla lokálně k dispozici a nejsou hotlinkována.

## Form integration

Formulář `#poptavka-form` **neodesílá data na žádný server** — odeslání je zatím
pouze simulováno na frontendu (viz `js/main.js`). Vše je připraveno k napojení:

1. **Kde napojit** (`js/main.js`, blok označený `TODO(IT): Production form endpoint`
   uvnitř `form.addEventListener('submit', …)`): nahradit `setTimeout`/`onSuccess`
   reálným `fetch()` na produkční endpoint, např.:
   ```js
   var data = new FormData(form);
   fetch("/api/poptavka", { method: "POST", body: data })
     .then(function (r) { if (!r.ok) throw new Error(); return r; })
     .then(onSuccess)
     .catch(onError);   // onError skeleton je připraven (zakomentovaný) hned pod blokem
   ```
   Alternativně lze místo JS použít klasický submit — doplnit `action="…"`
   a `method="post"` na `<form id="poptavka-form">` (nyní `action="#"`).
2. **Pole** (name atributy): `jmeno, firma, email, telefon, veletrh, datum, stanek,
   osoby, zajem[] (checkboxy), poznamka, souhlas`. Skryté `web` = **honeypot**
   (anti-spam) — pokud přijde vyplněné, poptávku zahoďte.
3. **Server MUSÍ** provést vlastní validaci a sanitizaci, ochranu proti spamu
   (rate limiting / CAPTCHA), CSRF ochranu a bezpečné uložení/odeslání (např. e-mail
   na `catering@congusto.cz`). Frontendová validace je jen UX, ne bezpečnostní prvek.

## Production checklist

Podrobně a s příkazy v `DEPLOY.md` → „Spuštění naostro“. Ve zkratce:

1. DNS: IT přidá `CNAME bvv → cname.vercel-dns.com.` u regzone.cz.
2. Napojit formulář na reálný endpoint + server-side validace/sanitizace/anti-spam/CSRF (viz výše).
3. Doplnit reálný odkaz na „Zpracování osobních údajů“ (2× `href="#"`).
4. Povolit indexaci — `noindex` je na **třech** místech (`vercel.json`, `index.html`, `robots.txt`).
5. Vyřešit analytiku a consent (viz Privacy) — teprv poté vkládat tracking.

Hotovo: produkční URL (`canonical` / `og:url` / `og:image` = `bvv.congustocatering.cz`),
bezpečnostní hlavičky ve `vercel.json`.

## Security

Implementováno na frontendu:
- Žádné secrets/klíče v kódu, žádný `eval`, žádné inline `onclick` handlery.
- Externí odkazy (`target="_blank"`) mají `rel="noopener noreferrer"`.
- Formulář = nedůvěryhodný vstup; JS do DOMu nevkládá uživatelský vstup přes `innerHTML`
  (stavové hlášky jsou statické texty přes `textContent`).
- Honeypot pole proti botům.

HTTP hlavičky jsou **nastavené a ověřené na produkci** ve `vercel.json`
(plné znění viz `DEPLOY.md` → „Bezpečnostní hlavičky“):
CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`,
`Permissions-Policy`, `Cross-Origin-Opener-Policy`.

**CSP je přísná (`style-src 'self'`, `script-src 'self'`) — v `index.html` proto
nesmí být inline `style="…"`, `<style>` ani `<script>`.** Prohlížeč by je zablokoval.
Všechny styly patří do `css/style.css` jako třídy. Pokud se přidá cokoli externího
(GTM/analytics, cizí font, API na jiné doméně), je nutné CSP rozšířit —
u API jde o `connect-src`.

`.vercelignore` zajišťuje, že se `podklady/` (licencovaný font Acumin Pro, brand manuál)
a interní `*.md` na produkci nedostanou — ověřeno, vrací 404.

## Privacy

- Stránka **neobsahuje žádné trackery** (GA, Meta Pixel, GTM) — záměrně.
- Font i všechny assety jsou lokální → žádné volání na třetí strany, žádné cookies.
- **Analytics / tracking integration:** produkční GTM / analytics vloží IT až po
  vyřešení consent managementu. Doporučené místo: těsně před `</head>` (nebo přes
  server-side GTM). Před nasazením trackerů zajistit cookie/consent lištu a upravit CSP.

## SEO

Hotovo: `<title>`, meta description, Open Graph + Twitter card, `lang="cs"`,
sémantická struktura, jediné `<h1>` v hero, logická hierarchie `h2`/`h3`, alt texty
u obsahových obrázků, dekorativní obrázky `alt=""`, `theme-color`, SVG favicon,
`preload` hero obrázku.

Produkční URL nastavena na `https://bvv.congustocatering.cz/` (`canonical`, `og:url`,
`og:image`). Při změně domény upravit všechny tři + `robots.txt`.

**Pozor:** stránka je zatím záměrně mimo vyhledávače — `noindex` je na třech místech
(`vercel.json`, `index.html`, `robots.txt`) a před spuštěním se ruší všechna najednou.
Volitelné rozšíření: `sitemap.xml` a JSON-LD (`LocalBusiness`/`Service`).

## Known assumptions

- „RED“ v názvech log = purpurová `#4b0041` (ověřeno z SVG i barevného PDF v podkladech).
- Acumin Pro (firemní text font) je licenčně placený → pro web použit systémový stack.
- ConGusto font je minuskový → omezen na dekorativní lowercase prvky.
- Fotografie z webu congustocatering.cz jsou vlastní assety značky (rozumný předpoklad).
- Response time „obvykle do 24 hodin“ je uveden jako obvyklý, ne jako garance.
- Adresa a IČO nejsou veřejně na webu → na stránce vynechány (nevymýšlet).
- Con Gusto NENÍ prezentován jako oficiální partner BVV — „catering pro vystavovatele
  na BVV“ = zaměření na místo a cílovku, ne tvrzení o partnerství. Logo BVV se nepoužívá.

## Future Claude instructions

- **Zachovat vanilla HTML/CSS/JS** — žádné frameworky, žádný build, žádné npm závislosti.
- **Žádné inline styly ani skripty** — produkční CSP je zablokuje. Nové styly vždy
  jako třídu do `css/style.css` (pozor na pořadí pravidel a specificitu).
- **Zachovat vizuální styl Con Gusto** (barvy, tonalita, prémiový klid, žádná AI klišé).
- **Nevymýšlet fakta** — kontakty, reference, provozovny ani čísla bez ověřeného zdroje.
- **Neporušit responzivitu** — testovat 320/375/390/768/1024/desktop, hlídat horizontální overflow.
- **Před změnou pochopit současnou architekturu** (tento soubor + `index.html` struktura sekcí).
- **Po každé změně stránku otestovat** (lokální HTTP server + vizuální kontrola + konzole).
- Vykání, čeština, konkrétnost; vyhýbat se slovům „dokonalý, nejlepší, luxusní, na klíč, na míru, zážitek pro všechny smysly“.
