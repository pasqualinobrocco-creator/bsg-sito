/* BSG site — vanilla Tweaks panel
   Implements the host edit-mode protocol:
   listens for __activate/__deactivate, posts __edit_mode_available, persists via __edit_mode_set_keys.
*/
(function () {
  "use strict";

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#639730",
    "marqueeSpeed": "normal",
    "cursor": true,
    "showStats": true,
    "density": "default"
  }/*EDITMODE-END*/;

  // ---- state ----
  const tweaks = { ...TWEAK_DEFAULTS };

  // ---- apply ----
  function apply() {
    const r = document.documentElement;
    r.style.setProperty("--bsg-green-500", tweaks.accent);
    // derive a lighter tint for "300"
    r.style.setProperty("--bsg-green-300", lighten(tweaks.accent, 0.32));
    r.style.setProperty("--bsg-green-700", darken(tweaks.accent, 0.18));

    // marquee speed
    document.querySelectorAll(".marquee, .clients-band").forEach((m) => {
      m.classList.toggle("is-fast", tweaks.marqueeSpeed === "fast");
      m.classList.toggle("is-slow", tweaks.marqueeSpeed === "slow");
    });
    const speed = tweaks.marqueeSpeed === "fast" ? "16s" : tweaks.marqueeSpeed === "slow" ? "70s" : "38s";
    document.querySelectorAll(".marquee__track").forEach((t) => t.style.animationDuration = speed);
    const cspeed = tweaks.marqueeSpeed === "fast" ? "22s" : tweaks.marqueeSpeed === "slow" ? "90s" : "50s";
    document.querySelectorAll(".clients-band__track").forEach((t) => t.style.animationDuration = cspeed);

    // cursor
    document.body.classList.toggle("no-custom-cursor", !tweaks.cursor);
    const c = document.querySelector(".cursor");
    if (c) c.style.display = tweaks.cursor ? "" : "none";

    // hero stats
    const stats = document.querySelector(".hero-stats");
    if (stats) stats.style.display = tweaks.showStats ? "" : "none";

    // density
    document.body.dataset.density = tweaks.density;
  }

  // ---- color helpers ----
  function hexToRgb(h) {
    const m = h.replace("#", "");
    const n = m.length === 3 ? m.split("").map((c) => c + c).join("") : m;
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)];
  }
  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  }
  function lighten(hex, amt) {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
  }
  function darken(hex, amt) {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
  }

  // ---- panel UI ----
  function buildPanel() {
    const wrap = document.createElement("div");
    wrap.id = "tweaks-panel";
    wrap.innerHTML = `
      <style>
        #tweaks-panel {
          position: fixed; right: 24px; bottom: 24px;
          z-index: 9000;
          width: 320px;
          background: rgba(10, 13, 8, 0.94);
          color: #F2F4EE;
          backdrop-filter: blur(20px) saturate(1.3);
          -webkit-backdrop-filter: blur(20px) saturate(1.3);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.45);
          padding: 18px;
          font-family: "Lato", system-ui, sans-serif;
          font-size: 13px;
          cursor: auto;
          display: none;
        }
        body.theme-light #tweaks-panel {
          background: rgba(255,255,255,0.96);
          color: #1A1A1A;
          border-color: rgba(0,0,0,0.08);
        }
        #tweaks-panel.is-open { display: block; }
        #tweaks-panel header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 14px;
        }
        #tweaks-panel h4 {
          margin: 0;
          font-family: "Poppins", system-ui, sans-serif;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: -0.01em;
          text-transform: uppercase;
        }
        #tweaks-panel h4::before {
          content: "";
          display: inline-block;
          width: 8px; height: 8px;
          border-radius: 999px;
          background: var(--bsg-green-500, #639730);
          margin-right: 8px;
          vertical-align: middle;
        }
        #tweaks-panel .close {
          background: transparent; border: 0; color: inherit; opacity: 0.6;
          font-size: 18px; line-height: 1; cursor: pointer; padding: 2px 6px;
        }
        #tweaks-panel .close:hover { opacity: 1; }
        #tweaks-panel .row {
          display: flex; flex-direction: column; gap: 6px;
          margin-bottom: 14px;
        }
        #tweaks-panel label {
          font-family: "Poppins", system-ui, sans-serif;
          font-weight: 500;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          opacity: 0.7;
        }
        #tweaks-panel .swatches { display: flex; gap: 8px; }
        #tweaks-panel .swatch {
          width: 28px; height: 28px; border-radius: 999px;
          border: 2px solid rgba(255,255,255,0.15);
          cursor: pointer;
          transition: transform .14s ease, border-color .14s ease;
        }
        body.theme-light #tweaks-panel .swatch { border-color: rgba(0,0,0,0.08); }
        #tweaks-panel .swatch:hover { transform: scale(1.08); }
        #tweaks-panel .swatch.is-active { border-color: currentColor; }
        #tweaks-panel .seg {
          display: grid; grid-auto-flow: column; grid-auto-columns: 1fr;
          gap: 2px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          padding: 2px;
        }
        body.theme-light #tweaks-panel .seg { background: rgba(0,0,0,0.04); }
        #tweaks-panel .seg button {
          background: transparent; border: 0; padding: 8px 10px;
          color: inherit; font: inherit;
          border-radius: 6px;
          font-size: 12px; cursor: pointer;
          font-family: "Poppins", system-ui, sans-serif;
          font-weight: 500;
          opacity: 0.7;
        }
        #tweaks-panel .seg button.is-active {
          background: var(--bsg-green-500, #639730);
          color: #0A0D08;
          opacity: 1;
        }
        #tweaks-panel .switch {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 0; border-top: 1px solid rgba(255,255,255,0.08);
        }
        body.theme-light #tweaks-panel .switch { border-color: rgba(0,0,0,0.08); }
        #tweaks-panel .switch span { font-family: "Poppins", system-ui, sans-serif; font-weight: 500; font-size: 13px; }
        #tweaks-panel .switch input { appearance: none; width: 36px; height: 20px; background: rgba(255,255,255,0.18); border-radius: 999px; position: relative; cursor: pointer; transition: background .2s ease; }
        body.theme-light #tweaks-panel .switch input { background: rgba(0,0,0,0.12); }
        #tweaks-panel .switch input::after {
          content: ""; position: absolute; top: 2px; left: 2px;
          width: 16px; height: 16px; border-radius: 999px;
          background: #fff;
          transition: transform .2s ease;
        }
        #tweaks-panel .switch input:checked { background: var(--bsg-green-500, #639730); }
        #tweaks-panel .switch input:checked::after { transform: translateX(16px); }
        #tweaks-panel .hint {
          margin-top: 8px;
          font-size: 11px; line-height: 1.4;
          opacity: 0.5;
          font-family: "Lato", system-ui, sans-serif;
        }
      </style>

      <header>
        <h4>Tweaks BSG</h4>
        <button class="close" aria-label="Chiudi">×</button>
      </header>

      <div class="row">
        <label>Accent colore</label>
        <div class="swatches">
          <button class="swatch" data-accent="#639730" style="background: #639730" title="Verde BSG"></button>
          <button class="swatch" data-accent="#1D3D7E" style="background: #1D3D7E" title="Navy Padel"></button>
          <button class="swatch" data-accent="#A5143B" style="background: #A5143B" title="Burgundy Squisitus"></button>
          <button class="swatch" data-accent="#046AB4" style="background: #046AB4" title="Blue Excellere"></button>
          <button class="swatch" data-accent="#E1B340" style="background: #E1B340" title="Gold"></button>
        </div>
      </div>

      <div class="row">
        <label>Velocità marquee</label>
        <div class="seg" data-key="marqueeSpeed">
          <button data-value="slow">Lenta</button>
          <button data-value="normal">Normale</button>
          <button data-value="fast">Veloce</button>
        </div>
      </div>

      <div class="switch">
        <span>Cursore custom</span>
        <input type="checkbox" data-key="cursor">
      </div>

      <div class="switch">
        <span>Statistiche hero</span>
        <input type="checkbox" data-key="showStats">
      </div>

      <div class="hint">Le modifiche restano persistenti dopo il refresh.</div>
    `;
    document.body.appendChild(wrap);
    return wrap;
  }

  let panel;

  function setKey(key, value) {
    tweaks[key] = value;
    apply();
    syncUI();
    // persist
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { [key]: value } }, "*");
  }

  function syncUI() {
    if (!panel) return;
    // swatches
    panel.querySelectorAll(".swatch").forEach((b) => {
      b.classList.toggle("is-active", b.dataset.accent === tweaks.accent);
    });
    // segments
    panel.querySelectorAll(".seg").forEach((seg) => {
      const k = seg.dataset.key;
      seg.querySelectorAll("button").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.value === tweaks[k]);
      });
    });
    // switches
    panel.querySelectorAll(".switch input[type=checkbox]").forEach((cb) => {
      cb.checked = !!tweaks[cb.dataset.key];
    });
  }

  function bind() {
    panel.querySelector(".close").addEventListener("click", () => {
      panel.classList.remove("is-open");
      window.parent.postMessage({ type: "__edit_mode_dismissed" }, "*");
    });

    panel.querySelectorAll(".swatch").forEach((b) => {
      b.addEventListener("click", () => setKey("accent", b.dataset.accent));
    });

    panel.querySelectorAll(".seg button").forEach((b) => {
      b.addEventListener("click", () => {
        const k = b.parentElement.dataset.key;
        setKey(k, b.dataset.value);
      });
    });

    panel.querySelectorAll(".switch input[type=checkbox]").forEach((cb) => {
      cb.addEventListener("change", () => setKey(cb.dataset.key, cb.checked));
    });
  }

  // ---- host protocol ----
  window.addEventListener("message", (e) => {
    if (!e.data || typeof e.data !== "object") return;
    if (e.data.type === "__activate_edit_mode") {
      if (!panel) { panel = buildPanel(); bind(); syncUI(); }
      panel.classList.add("is-open");
    }
    if (e.data.type === "__deactivate_edit_mode") {
      if (panel) panel.classList.remove("is-open");
    }
  });

  // apply defaults immediately
  document.addEventListener("DOMContentLoaded", () => {
    apply();
    // announce availability
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
  });

})();

/* ---------- WhatsApp floating button (auto-inject) ---------- */
(function(){
  if (document.querySelector('.wa-float')) return;
  var number = '390612345678'; // TODO: sostituire con numero reale (formato internazionale senza +)
  var msg = encodeURIComponent('Ciao BSG, vorrei più informazioni.');
  var a = document.createElement('a');
  a.className = 'wa-float';
  a.href = 'https://wa.me/' + number + '?text=' + msg;
  a.target = '_blank';
  a.rel = 'noopener';
  a.setAttribute('aria-label', 'Scrivici su WhatsApp');
  a.innerHTML = '<span class="wa-label">Scrivici su WhatsApp</span>' +
    '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<path d="M16 .4C7.4.4.4 7.4.4 16c0 2.8.7 5.5 2.1 7.9L.3 31.6l7.9-2.1c2.3 1.3 4.9 1.9 7.6 1.9h.1c8.6 0 15.6-7 15.6-15.6S24.6.4 16 .4zm0 28.5c-2.4 0-4.7-.6-6.7-1.8l-.5-.3-4.7 1.2 1.3-4.6-.3-.5c-1.3-2.1-2-4.5-2-7 0-7.2 5.8-13 13-13s13 5.8 13 13-5.9 13-13.1 13zm7.1-9.7c-.4-.2-2.3-1.1-2.7-1.3-.4-.1-.6-.2-.9.2-.3.4-1 1.3-1.3 1.6-.2.3-.5.3-.9.1-.4-.2-1.6-.6-3.1-1.9-1.2-1-1.9-2.3-2.2-2.7-.2-.4 0-.6.2-.8.2-.2.4-.5.6-.7.2-.2.3-.4.4-.7.1-.3.1-.5 0-.7-.1-.2-.9-2.2-1.3-3-.3-.8-.7-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.5s1.5 4 1.7 4.3c.2.3 2.9 4.4 7 6.2.9.4 1.7.6 2.3.8.9.3 1.8.2 2.5.2.8-.1 2.3-.9 2.6-1.9.3-.9.3-1.8.2-1.9-.1-.2-.4-.3-.8-.5z"/>' +
    '</svg>';
  document.body.appendChild(a);
})();

/* ---------- Lenis smooth scroll (auto-inject) ---------- */
(function(){
  if (window.__lenisInit) return;
  window.__lenisInit = true;

  // Respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function init() {
    if (!window.Lenis) return;
    var lenis = new window.Lenis({
      duration: 1.15,
      easing: function(t){ return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    window.__lenis = lenis;

    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // Anchor links integration
    document.addEventListener('click', function(e){
      var a = e.target && e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var href = a.getAttribute('href');
      if (!href || href === '#' || href.length < 2) return;
      var el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { offset: -80 });
    });

    document.documentElement.classList.add('lenis-enabled');
  }

  var s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/lenis@1.1.20/dist/lenis.min.js';
  s.defer = true;
  s.onload = init;
  document.head.appendChild(s);
})();

/* ---------- Parallax (backgrounds & cards) ---------- */
(function(){
  if (window.__parallaxInit) return;
  window.__parallaxInit = true;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function setup() {
    // Auto-tag common backgrounds/cards if not already opted in
    document.querySelectorAll('.case-preview').forEach(function(el){
      if (!el.hasAttribute('data-parallax')) el.setAttribute('data-parallax', '0.12');
    });
    document.querySelectorAll('.news-card, .service-card, .client-card').forEach(function(el){
      if (!el.hasAttribute('data-parallax')) el.setAttribute('data-parallax', '0.06');
    });

    var items = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (!items.length) return;

    items.forEach(function(el){
      el.style.willChange = 'transform';
      // For background-image elements, scale slightly to avoid edge gaps
      var cs = window.getComputedStyle(el);
      if (cs && cs.backgroundImage && cs.backgroundImage !== 'none') {
        el.style.backgroundSize = el.style.backgroundSize || 'cover';
        el.style.backgroundPosition = el.style.backgroundPosition || 'center';
      }
    });

    var vh = window.innerHeight;
    var ticking = false;

    function update() {
      ticking = false;
      var viewportCenter = window.scrollY + vh / 2;
      for (var i = 0; i < items.length; i++) {
        var el = items[i];
        var rect = el.getBoundingClientRect();
        // Skip far-off elements
        if (rect.bottom < -vh || rect.top > vh * 2) continue;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0;
        var elCenter = window.scrollY + rect.top + rect.height / 2;
        var delta = (elCenter - viewportCenter) * speed * -1;
        el.style.transform = 'translate3d(0,' + delta.toFixed(2) + 'px,0)';
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', function(){ vh = window.innerHeight; onScroll(); });
    // Hook into Lenis if available for buttery sync
    var hookLenis = function(){
      if (window.__lenis && window.__lenis.on) {
        window.__lenis.on('scroll', onScroll);
        return true;
      }
      return false;
    };
    if (!hookLenis()) {
      var tries = 0;
      var iv = setInterval(function(){
        if (hookLenis() || ++tries > 20) clearInterval(iv);
      }, 250);
    }
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
