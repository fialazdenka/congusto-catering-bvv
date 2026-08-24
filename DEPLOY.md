# Nasazení — Vercel + doména `bvv.congustocatering.cz`

Provozní dokumentace k hostingu. Obsahové a brandové věci viz `CLAUDE.md`.

## Kde projekt běží

| | |
|---|---|
| Vercel projekt | `congusto-catering-bvv` (scope `zdenkafiala's projects`, plán Pro) |
| Produkční URL (dočasná) | https://congusto-catering-bvv.vercel.app |
| Cílová doména | **https://bvv.congustocatering.cz** |
| GitHub repo | `fialazdenka/congusto-catering-bvv`, produkční větev `main` |
| Build | žádný — statické soubory se nahrávají tak, jak jsou |

Projekt je propojený s GitHubem: **každý push do `main` = automatický produkční deploy**,
push do jiné větve / PR = preview deploy s vlastní URL.

## Deploy z terminálu

```bash
cd "Catering na BVV"

npx vercel            # preview deploy (dočasná URL, k odsouhlasení)
npx vercel --prod     # produkční deploy
```

Co se nahrává, řídí `.vercelignore` — složka `podklady/` ani interní `*.md`
soubory se na server **nedostanou** (ověřeno, vrací 404).

## Aktuální stav: soukromé a neindexované

Dvě nezávislé vrstvy, obě jsou teď aktivní:

1. **Vercel Authentication** (Settings → Deployment Protection).
   Nastaveno na *All Deployments except Custom Domains* — všechny
   `*.vercel.app` adresy vyžadují přihlášení do Vercelu. Anonymní návštěvník
   dostane přesměrování na login, ne obsah.
2. **Zákaz indexace** — trojitá pojistka:
   - `vercel.json` → hlavička `X-Robots-Tag: noindex, nofollow`
   - `index.html` → `<meta name="robots" content="noindex, nofollow">`
   - `robots.txt` → `Disallow: /`

> ⚠ **Pozor po napojení domény:** vrstva 1 chrání jen `*.vercel.app`. Jakmile
> `bvv.congustocatering.cz` začne fungovat, bude veřejně dostupná — chránit ji
> bude už jen zákaz indexace (do Googlu se nedostane, ale kdo zná adresu, uvidí ji).
> Pokud má být uzamčená i doména, přepněte v Settings → Deployment Protection
> na *All Deployments* (na plánu Pro k dispozici) nebo zapněte Password Protection.

## Napojení domény — co potřebuje IT

Doména `congustocatering.cz` je vedená u **regzone.cz** (nameservery
`ns1.regzone.cz` / `.de` / `.info`). Nameservery se **neměníme** — hlavní web
`www.congustocatering.cz` běží dál beze změny. Stačí přidat **jeden nový záznam**
pro subdoménu:

**Varianta A — CNAME (doporučeno pro subdomény):**

| Typ | Název / Host | Hodnota | TTL |
|---|---|---|---|
| `CNAME` | `bvv` | `cname.vercel-dns.com.` | 3600 |

**Varianta B — A záznam (pokud CNAME nejde použít):**

| Typ | Název / Host | Hodnota | TTL |
|---|---|---|---|
| `A` | `bvv` | `76.76.21.21` | 3600 |

Doména je už na straně Vercelu k projektu přiřazená a čeká na DNS. Po propsání
záznamu (obvykle desítky minut) Vercel sám vystaví HTTPS certifikát.

Kontrola stavu:

```bash
dig +short bvv.congustocatering.cz
npx vercel domains inspect bvv.congustocatering.cz
```

## Poptávkový formulář — čeká na endpoint od IT

Formulář zatím **nikam neodesílá data** (odeslání se jen simuluje v prohlížeči).
Napojení je připravené v `js/main.js` u komentáře `TODO(IT): Production form endpoint`.

Odesílají se pole: `jmeno, firma, email, telefon, veletrh, datum, stanek, osoby,
zajem[], poznamka, souhlas` + skryté `web` = **honeypot** (je-li vyplněné, jde o bota
a poptávka se zahazuje).

**Bezpečnostní požadavky na endpoint** (poptávky obsahují osobní údaje —
jméno, e-mail, telefon):

- **Jen HTTPS.** Endpoint na `https://bvv.congustocatering.cz/api/…` (stejná doména)
  je nejbezpečnější — nevyžaduje CORS a data neopouštějí náš původ. Pokud bude
  endpoint na cizí doméně, je nutné rozšířit `connect-src` v CSP ve `vercel.json`.
- **Validace a sanitizace na serveru.** Frontendová validace je jen UX, ne ochrana.
- **Anti-spam:** rate limiting na IP + kontrola honeypotu; případně CAPTCHA.
- **CSRF ochrana**, pokud endpoint pracuje se session.
- **Nikde neukládat víc, než je potřeba.** Ideálně poptávku rovnou odeslat e-mailem
  na `catering@congusto.cz` a neskladovat ji v databázi. Když databáze být musí,
  pak šifrované úložiště a omezený přístup.
- **Žádné osobní údaje v URL** (query string) — vždy POST v těle požadavku.
- **Žádné klíče a tokeny v `js/main.js`** — frontend je veřejný. Tajné hodnoty
  patří do Environment Variables ve Vercelu (`npx vercel env add`).
- **Retenční lhůta** a odkaz na *Zpracování osobních údajů* — viz níže.

## Spuštění naostro — checklist

1. **DNS** — IT přidá záznam podle tabulky výše, ověřit `vercel domains inspect`.
2. **Formulář** — napojit reálný endpoint (viz výše) a otestovat odeslání.
3. **Zpracování osobních údajů** — doplnit reálný odkaz místo `href="#"`
   (2× v `index.html`: souhlas u formuláře a patička).
4. **Povolit indexaci** — všechny tři pojistky najednou:
   - `vercel.json` → smazat blok `X-Robots-Tag`
   - `index.html` → smazat `<meta name="robots" …>` včetně komentáře nad ním
   - `robots.txt` → nahradit blokem „PO SPUŠTĚNÍ“
5. **Deployment Protection** — pokud byla přepnutá na *All Deployments*, vrátit ji
   tak, aby veřejná doména byla dostupná.
6. **Nasadit** (`git push` nebo `npx vercel --prod`) a ověřit:
   ```bash
   curl -sI https://bvv.congustocatering.cz/ | grep -i 'x-robots-tag\|content-security'
   ```
   `x-robots-tag` už se nesmí objevit.
7. Volitelně doplnit `sitemap.xml` a přidat web do Google Search Console.

## Bezpečnostní hlavičky

Nastavené ve `vercel.json`, platí pro všechny odpovědi (ověřeno na produkci):

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self';
    script-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self';
    frame-ancestors 'none'; base-uri 'self'; object-src 'none'; upgrade-insecure-requests
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
```

CSP je záměrně přísná — **stránka nesmí obsahovat inline `<style>`, `style="…"`
atributy ani inline `<script>`**, jinak je prohlížeč zablokuje. Proto jsou všechny
styly v `css/style.css`. Při přidávání čehokoli externího (analytika, fonty,
API na jiné doméně) je nutné CSP odpovídajícím způsobem rozšířit.

## Cachování

| Cesta | Cache-Control |
|---|---|
| `/assets/fonts/*` | `max-age=31536000, immutable` (font se nemění) |
| `/assets/img/*`, `/assets/logo/*` | `max-age=604800, stale-while-revalidate=2592000` |
| `/css/*`, `/js/*` | `max-age=0, must-revalidate` (změny jsou hned vidět) |

Pokud se vymění fotka pod stejným názvem, může se u návštěvníků zobrazovat až
7 dní stará verze — buď počkat, nebo nahrát pod novým názvem.
