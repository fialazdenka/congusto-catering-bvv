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
├─ js/main.js                 # vanilla JS: nav, sticky header, reveal, validace + odeslání formuláře
├─ api/poptavka.mjs           # Vercel funkce: formulář → e-mail přes Microsoft Graph (bez závislostí)
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

Cílová doména: **`bvv.congustocatering.cz`** (přiřazená k projektu, DNS i certifikát hotové 8. 10. 2026; dříve: čeká na DNS
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
- ~~Odkaz na Zpracování osobních údajů~~ — hotovo (30. 9. 2026):
  `https://www.congusto.cz/gdpr/` (consent + patička).
- Potvrdit formulaci „odpověď obvykle do 24 hodin“ (je to interní příslib, ne garance).
- Případně nahradit `team-care.jpg` kvalitnější fotografií.

Reference jsou uvedené jako textové názvy (ne loga) — jde o veřejně prezentované
klienty. Loga třetích stran nebyla lokálně k dispozici a nejsou hotlinkována.

## Form integration

Formulář `#poptavka-form` odesílá `js/main.js` (fetch, POST, `FormData`) na
**`/api/poptavka`** = `api/poptavka.mjs` (Vercel Node funkce, Web `Request`/`Response`,
bez npm závislostí). Funkce poptávku ověří a pošle e-mailem přes **Microsoft Graph
`sendMail`** ze sdílené schránky `noreply@congusto.cz` na `catering@congusto.cz`
(Reply-To = e-mail zákazníka). **Nic se neukládá** — žádná DB, `saveToSentItems: false`,
osobní údaje se nelogují. Rozhodnutí klientky: M365 místo Brevo (k Brevu nemá přístup),
data nesmí být nikde online uložená.

- Konfigurace jen přes env proměnné `M365_TENANT_ID`, `M365_CLIENT_ID`,
  `M365_CLIENT_SECRET`, `MAIL_FROM`, `MAIL_TO`. Bez nich funkce vrací 503 a
  frontend ukáže chybovou hlášku s telefonem/e-mailem (žádný falešný úspěch).
- Pole: `jmeno, firma, email, telefon, veletrh, datum, stanek, osoby, zajem`
  (checkboxy, stejné name), `poznamka, souhlas`; skryté `web` = honeypot;
  `_t` (doplňuje JS) = doba vyplňování, < 3 s = bot. Botům funkce vrací 200 a nic neposílá.
- Anti-spam: honeypot, časová past, kontrola `Origin` = host, serverová validace,
  limit 20 kB, in-memory limit 5/10 min na IP a instanci. Spolehlivý rate limit
  = Vercel Firewall pravidlo na `/api/poptavka` (nastavuje se v dashboardu).
- Přidání pole do formuláře = upravit i `FIELDS` v `api/poptavka.mjs`.
- Návod pro IT (Entra app, `Mail.Send`, omezení na schránku, expirace secretu)
  je v `DEPLOY.md`.

## Production checklist

Podrobně a s příkazy v `DEPLOY.md` → „Spuštění naostro“. Ve zkratce:

1. DNS: IT přidá `CNAME bvv → cname.vercel-dns.com.` u regzone.cz.
2. IT: M365 aplikace + env proměnné pro formulář, Firewall rate limit, test odeslání.
3. ~~Odkaz na „Zpracování osobních údajů“~~ — hotovo.
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

## Kde jsme skončili (8. 10. 2026)

Stránka běží na **`https://bvv.congustocatering.cz`** (DNS u regzone.cz hotové,
TLS certifikát vystaven 8. 10. 2026 ručně přes `npx vercel certs issue` — Vercel
ho po přidání DNS sám nevydal). Formulář (`/api/poptavka`, M365 Graph) a odkaz na
GDPR (`https://www.congusto.cz/gdpr/`) jsou commitnuté a pushnuté do `main`.

**Hotovo 1. 10. 2026:**
- IT dodalo Entra aplikaci (app „noreply Congusto“). Env proměnné `M365_TENANT_ID`,
  `M365_CLIENT_ID`, `M365_CLIENT_SECRET` (*Sensitive*), `MAIL_FROM=noreply@congusto.cz`,
  `MAIL_TO=catering@congusto.cz` jsou ve Vercelu pro **Production i Preview**.
- Token z Entra funguje. Testovací poptávka („TEST – ověření formuláře“) z preview
  deploye `congusto-catering-cf28ybu37-…vercel.app` → funkce vrátila 200, Graph
  `sendMail` přijal.

**Otevřené body:**
1. **Ověřit doručení** — klientka má zkontrolovat, zda test dorazil do
   `catering@congusto.cz` (i spam).
2. **Rotovat client secret** — byl vložen v plain textu do chatu. IT vygeneruje nový,
   vloží ho přímo do Vercelu (`M365_CLIENT_SECRET`, Production + Preview, pak redeploy)
   a starý v Entra smaže. Nový secret do chatu neposílat.
3. **Ověřit u IT omezení aplikace na schránku noreply** — token neobsahuje roli
   `Mail.Send` (odeslání přesto prošlo → pravděpodobně Exchange RBAC for Applications).
4. ~~Commit + push~~ — hotovo 8. 10. 2026.
5. ~~DNS + certifikát~~ — hotovo 8. 10. 2026.
6. Vercel Firewall rate limit na `/api/poptavka` (doporučeno).
7. Zrušit `noindex` (3 místa najednou — `vercel.json`, `index.html`, `robots.txt`).
8. Zamknout `bvv.congustocatering.cz` do spuštění (Deployment Protection → *All Deployments*)?

**Neověřeno vizuálně:** přepis inline `style=""` do CSS tříd (CTA karta a purpurová
sekce s poptávkou) — Chrome rozšíření nebylo připojené.

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
