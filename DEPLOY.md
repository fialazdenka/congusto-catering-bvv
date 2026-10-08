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

## Poptávkový formulář → e-mail přes Microsoft 365

Formulář odesílá `js/main.js` (fetch, POST) na **`/api/poptavka`** — serverová
funkce ve stejném Vercel projektu (`api/poptavka.mjs`, bez závislostí). Funkce
poptávku ověří a pošle **e-mailem přes Microsoft Graph** ze schránky
`noreply@congusto.cz` na `catering@congusto.cz`. Odpovědí na e-mail se píše
rovnou zákazníkovi (jeho adresa je v Reply-To).

**Data se nikde neukládají:** žádná databáze, kopie se neukládá ani do
„Odeslaných“ schránky noreply (`saveToSentItems: false`), osobní údaje se
nepíšou do logů Vercelu. Poptávka existuje jen v cílové schránce.

Dokud nejsou nastavené proměnné níže, funkce vrací 503 a návštěvník vidí
hlášku „Odeslání se nezdařilo… zavolejte / napište“ — nic se tiše neztratí.

### Co musí udělat IT (Microsoft 365 / Entra)

1. **Schránka odesílatele** `noreply@congusto.cz` — založit jako **sdílenou
   schránku** (shared mailbox, nepotřebuje licenci). Pokud už existuje, použít ji.
2. **Registrace aplikace** v Microsoft Entra ID (App registrations → New),
   např. „Web BVV – poptávkový formulář“, single tenant.
3. **Oprávnění:** Microsoft Graph → *Application permission* **`Mail.Send`**
   → *Grant admin consent*.
4. **Omezit aplikaci jen na schránku noreply** (jinak by mohla posílat
   jménem kohokoli v tenantu) — v Exchange Online přes *RBAC for Applications*
   (management scope na `noreply@congusto.cz`), případně starší
   *Application Access Policy*.
5. **Client secret** vytvořit (Certificates & secrets) a zapsat si **datum
   expirace** — po vypršení formulář přestane odesílat (vrací chybu). Založit
   si připomínku na obnovu.
6. Předat hodnoty: **Tenant ID, Client ID, Client secret** (bezpečnou cestou,
   ne e-mailem v čitelné podobě).

### Proměnné prostředí ve Vercelu

Settings → Environment Variables (nebo `npx vercel env add <NÁZEV> production`),
prostředí **Production** (případně i Preview pro testování). Po přidání redeploy.

| Název | Hodnota |
|---|---|
| `M365_TENANT_ID` | Directory (tenant) ID |
| `M365_CLIENT_ID` | Application (client) ID |
| `M365_CLIENT_SECRET` | client secret (označit jako *Sensitive*) |
| `MAIL_FROM` | `noreply@congusto.cz` |
| `MAIL_TO` | `catering@congusto.cz` (víc adres oddělit čárkou) |

### Ochrana proti spamu (bez CAPTCHA, bez cookies)

- **Honeypot** — skryté pole `web`; vyplněné = bot → tváříme se úspěšně, nic se neodešle.
- **Časová past** — formulář odeslaný do 3 s od načtení stránky se zahodí (pole `_t`).
- **Kontrola původu** — `Origin` musí odpovídat doméně, na které funkce běží.
- **Serverová validace** — povinná pole, formát e-mailu/telefonu, délky,
  souhlas, povolené hodnoty checkboxů; HTML v e-mailu je escapované.
- **Limit velikosti** požadavku (20 kB) a jednoduchý limit 5 poptávek / 10 min
  na IP v rámci jedné instance funkce.
- **Doporučeno doplnit ve Vercelu:** Firewall → Rules → *Rate Limit* na cestu
  `/api/poptavka` (např. 5 požadavků / 10 min na IP, akce *Deny*). To je
  spolehlivý limit napříč všemi instancemi.
- Pokud by spam přesto procházel: doplnit Cloudflare Turnstile (vyžaduje úpravu CSP).

CSRF: funkce nepracuje se session ani cookies, takže klasické CSRF nehrozí;
kontrola `Origin` navíc brání odesílání z cizích webů.

### Test po nastavení

Vyplnit formulář na preview/produkci → e-mail musí dorazit do `catering@congusto.cz`.
Chyby odeslání jsou v Vercel → Logs (`poptavka: …`), bez osobních údajů.

## Spuštění naostro — checklist

1. **DNS** — IT přidá záznam podle tabulky výše, ověřit `vercel domains inspect`.
2. **Formulář** — IT připraví M365 aplikaci, doplnit proměnné prostředí
   (viz výše), nastavit Firewall rate limit a otestovat odeslání.
3. ~~Zpracování osobních údajů~~ — hotovo, odkazuje na
   `https://www.congusto.cz/gdpr/`.
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
