/* ==================================================================
   POST /api/poptavka — poptávkový formulář → e-mail přes Microsoft 365
   ------------------------------------------------------------------
   Poptávku NIKAM neukládá: přijme formulář, ověří ho a odešle jako
   e-mail přes Microsoft Graph (sendMail) ze schránky MAIL_FROM na
   MAIL_TO. Kopie se neukládá ani do „Odeslaných“ (saveToSentItems:
   false). Osobní údaje se nezapisují do logů.

   Proměnné prostředí (Vercel → Settings → Environment Variables):
     M365_TENANT_ID      ID tenantu (Directory ID) v Microsoft Entra
     M365_CLIENT_ID      Application (client) ID registrované aplikace
     M365_CLIENT_SECRET  Client secret té aplikace (má expiraci!)
     MAIL_FROM           odesílací schránka, např. noreply@congusto.cz
     MAIL_TO             příjemce poptávek, např. catering@congusto.cz

   Anti-spam: honeypot, časová past, kontrola původu (Origin),
   limit velikosti, jednoduchý limit na IP. Hlavní rate limit patří
   do Vercel Firewall (viz DEPLOY.md).
   ================================================================== */

const MAX_BODY_BYTES = 20000;
const MIN_FILL_MS = 3000;            // rychlejší vyplnění = bot
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;                  // max. poptávek z 1 IP za okno (na instanci)

const FIELDS = {
  jmeno:    { label: "Jméno",        max: 120, required: true },
  firma:    { label: "Firma",        max: 160 },
  email:    { label: "E-mail",       max: 200, required: true },
  telefon:  { label: "Telefon",      max: 40,  required: true },
  veletrh:  { label: "Veletrh / akce", max: 160 },
  datum:    { label: "Termín",       max: 10 },
  stanek:   { label: "Číslo stánku", max: 60 },
  osoby:    { label: "Počet osob",   max: 6 },
  poznamka: { label: "Poznámka",     max: 3000 },
};
const ZAJEM = [
  "Občerstvení na stánek", "Obchodní schůzky", "VIP klienti",
  "Občerstvení pro tým", "Večerní akce", "Jiné",
];

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;
const PHONE_RE = /^[+0-9 ()\-./]{6,40}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const hits = new Map();
let tokenCache = { value: null, expires: 0 };

const json = (status, body) => Response.json(body, {
  status,
  headers: { "Cache-Control": "no-store" },
});

const clean = (v, max) =>
  String(v ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, max);

const esc = (s) => s
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_MAX;
}

async function getToken() {
  if (tokenCache.value && Date.now() < tokenCache.expires) return tokenCache.value;
  const res = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(process.env.M365_TENANT_ID)}/oauth2/v2.0/token`,
    {
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.M365_CLIENT_ID,
        client_secret: process.env.M365_CLIENT_SECRET,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );
  if (!res.ok) throw new Error(`token ${res.status}`);
  const data = await res.json();
  tokenCache = { value: data.access_token, expires: Date.now() + (data.expires_in - 120) * 1000 };
  return tokenCache.value;
}

function buildMail(v, zajem) {
  const rows = Object.entries(FIELDS)
    .filter(([key]) => key !== "poznamka")
    .map(([key, f]) => [f.label, v[key]]);
  rows.splice(8, 0, ["O co mají zájem", zajem.join(", ")]);

  const tr = rows
    .map(([label, val]) =>
      `<tr><th align="left" style="padding:4px 12px 4px 0;color:#555;font-weight:normal">${esc(label)}</th>` +
      `<td style="padding:4px 0">${val ? esc(val) : "—"}</td></tr>`)
    .join("");
  const note = v.poznamka
    ? `<p style="margin:16px 0 4px;color:#555">Poznámka:</p><p style="margin:0;white-space:pre-wrap">${esc(v.poznamka)}</p>`
    : "";

  const subjectBits = [v.firma || v.jmeno, v.veletrh].filter(Boolean).join(" · ");
  return {
    subject: `Poptávka BVV – ${subjectBits}`.replace(/[\r\n]+/g, " ").slice(0, 200),
    html:
      `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0f0f0f">` +
      `<p>Nová nezávazná poptávka z webu <strong>bvv.congustocatering.cz</strong>.</p>` +
      `<table cellspacing="0" cellpadding="0">${tr}</table>${note}` +
      `<p style="margin-top:20px;color:#777;font-size:12px">Odpovědí na tento e-mail napíšete přímo zákazníkovi. ` +
      `Zákazník udělil souhlas se zpracováním osobních údajů za účelem vyřízení poptávky.</p></div>`,
  };
}

export async function POST(request) {
  // 1) Původ: jen formulář z naší domény
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  let originHost = null;
  try { originHost = origin && new URL(origin).host; } catch { /* neplatný Origin */ }
  if (!originHost || originHost !== host) return json(403, { ok: false });

  // 2) Velikost a limit na IP
  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_BODY_BYTES) return json(413, { ok: false });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return json(429, { ok: false });

  let form;
  try { form = await request.formData(); } catch { return json(400, { ok: false }); }

  // 3) Honeypot + časová past — botovi tváříme úspěch, nic neodesíláme
  const elapsed = Number(form.get("_t"));
  if (clean(form.get("web"), 200) || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return json(200, { ok: true });
  }

  // 4) Validace
  const v = {};
  for (const [key, f] of Object.entries(FIELDS)) {
    v[key] = clean(form.get(key), f.max);
    if (f.required && !v[key]) return json(422, { ok: false, field: key });
  }
  if (!EMAIL_RE.test(v.email)) return json(422, { ok: false, field: "email" });
  if (!PHONE_RE.test(v.telefon)) return json(422, { ok: false, field: "telefon" });
  if (v.datum && !DATE_RE.test(v.datum)) v.datum = "";
  if (v.osoby && !/^\d{1,5}$/.test(v.osoby)) v.osoby = "";
  if (form.get("souhlas") !== "on") return json(422, { ok: false, field: "souhlas" });
  const zajem = form.getAll("zajem").map(String).filter((z) => ZAJEM.includes(z));

  // 5) Odeslání e-mailu
  const { M365_TENANT_ID, M365_CLIENT_ID, M365_CLIENT_SECRET, MAIL_FROM, MAIL_TO } = process.env;
  if (!M365_TENANT_ID || !M365_CLIENT_ID || !M365_CLIENT_SECRET || !MAIL_FROM || !MAIL_TO) {
    console.error("poptavka: chybí konfigurace M365_* / MAIL_*");
    return json(503, { ok: false });
  }

  const mail = buildMail(v, zajem);
  try {
    const token = await getToken();
    const res = await fetch(
      `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(MAIL_FROM)}/sendMail`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: {
            subject: mail.subject,
            body: { contentType: "HTML", content: mail.html },
            toRecipients: MAIL_TO.split(",").map((a) => ({ emailAddress: { address: a.trim() } })),
            replyTo: [{ emailAddress: { address: v.email, name: v.jmeno } }],
          },
          saveToSentItems: false,
        }),
      },
    );
    if (!res.ok) throw new Error(`sendMail ${res.status}`);
  } catch (err) {
    // Jen technická chyba, žádné údaje z formuláře
    console.error("poptavka: odeslání selhalo –", err.message);
    return json(502, { ok: false });
  }

  return json(200, { ok: true });
}

export function GET() {
  return json(405, { ok: false });
}
