/* =============================================================
   Con Gusto Catering — landing page BVV
   Vanilla JS. Progressive enhancement: bez JS zůstává obsah
   čitelný, odkazy funkční a formulář odeslatelný na server.
   ============================================================= */
(function () {
  "use strict";

  /* ---------- 1. Rok v patičce ------------------------------------ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 2. Sticky header: stav po scrollu ------------------- */
  var header = document.querySelector(".site-header");
  var setScrolled = function () {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  setScrolled();
  window.addEventListener("scroll", setScrolled, { passive: true });

  /* Přesná výška hlavičky → hero se podsune bez mezery nad obrázkem */
  var syncHeaderHeight = function () {
    if (!header) return;
    document.documentElement.style.setProperty("--hdr", header.offsetHeight + "px");
  };
  syncHeaderHeight();
  window.addEventListener("resize", syncHeaderHeight);
  window.addEventListener("load", syncHeaderHeight);

  /* ---------- 3. Mobilní navigace --------------------------------- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  var backdrop = document.getElementById("nav-backdrop");

  var openNav = function () {
    nav.classList.add("is-open");
    if (backdrop) { backdrop.hidden = false; requestAnimationFrame(function () { backdrop.classList.add("is-open"); }); }
    document.body.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Zavřít menu");
  };
  var closeNav = function () {
    nav.classList.remove("is-open");
    if (backdrop) {
      backdrop.classList.remove("is-open");
      window.setTimeout(function () { backdrop.hidden = true; }, 320);
    }
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Otevřít menu");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) closeNav(); else openNav();
    });
    if (backdrop) backdrop.addEventListener("click", closeNav);
    nav.addEventListener("click", function (e) {
      var t = e.target;
      if (t && t.tagName === "A") closeNav();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(); toggle.focus(); }
    });
    // Při zvětšení na desktop menu resetuj
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && nav.classList.contains("is-open")) closeNav();
    });
  }

  /* ---------- 4. Reveal on scroll --------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- 5. Formulář: validace + odeslání -------------------- */
  var form = document.getElementById("poptavka-form");
  if (!form) return;

  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");

  var setFieldError = function (input, hasError) {
    var field = input.closest(".field");
    if (field) field.classList.toggle("has-error", hasError);
    input.setAttribute("aria-invalid", hasError ? "true" : "false");
  };

  var validateField = function (input) {
    var ok = input.checkValidity();
    setFieldError(input, !ok);
    return ok;
  };

  // Průběžná validace: odeber chybu, jakmile je pole v pořádku
  form.querySelectorAll("input[required], input[type=email]").forEach(function (input) {
    input.addEventListener("blur", function () { validateField(input); });
    input.addEventListener("input", function () {
      if (input.closest(".field") && input.closest(".field").classList.contains("has-error")) {
        validateField(input);
      }
    });
  });

  var showStatus = function (type, msg) {
    if (!statusEl) return;
    statusEl.className = "form-status is-" + type;
    statusEl.textContent = msg;
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Honeypot: pokud je vyplněný, tiše ignoruj (spam bot)
    var honey = form.querySelector('input[name="web"]');
    if (honey && honey.value) return;

    // Validace všech povinných polí
    var required = form.querySelectorAll("[required]");
    var firstInvalid = null;
    var valid = true;
    required.forEach(function (input) {
      var ok = input.checkValidity();
      setFieldError(input, !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
      if (!ok) valid = false;
    });

    if (!valid) {
      showStatus("error", "Zkontrolujte prosím zvýrazněná pole a odešlete formulář znovu.");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    /* -----------------------------------------------------------------
       TODO(IT): Production form endpoint.
       Nyní se odeslání pouze simuluje na straně prohlížeče — data se
       NIKAM neodesílají. Pro ostrý provoz nahraďte blok níže reálným
       voláním, např.:

         var data = new FormData(form);
         fetch("/api/poptavka", { method: "POST", body: data })
           .then(function (r) { if (!r.ok) throw new Error(); return r; })
           .then(function () { onSuccess(); })
           .catch(function () { onError(); });

       Server MUSÍ provést vlastní validaci a sanitizaci vstupu,
       ochranu proti spamu (rate limiting / CAPTCHA) a CSRF ochranu.
       Podrobnosti viz README.md a CLAUDE.md.
    ------------------------------------------------------------------ */
    submitBtn.disabled = true;
    var originalText = submitBtn.textContent;
    submitBtn.textContent = "Odesílám…";

    window.setTimeout(function () {
      onSuccess();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 700);

    function onSuccess() {
      showStatus("success", "Děkujeme, poptávku jsme přijali. Ozveme se vám co nejdříve. (Ukázkový režim — napojení odesílání zajistí IT.)");
      form.reset();
      form.querySelectorAll(".has-error").forEach(function (f) { f.classList.remove("has-error"); });
      statusEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    // function onError() { showStatus("error", "Odeslání se nezdařilo. Zkuste to prosím znovu, nebo nám napište na catering@congusto.cz."); submitBtn.disabled = false; submitBtn.textContent = originalText; }
  });
})();
