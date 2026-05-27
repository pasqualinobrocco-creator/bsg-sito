/* BSG site — motion & interactions */
(function () {
  "use strict";

  // ---------- Custom cursor ----------
  const cursor = document.createElement("div");
  cursor.className = "cursor";
  document.body.appendChild(cursor);

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let supportsHover = window.matchMedia("(hover: hover)").matches;

  if (supportsHover) {
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });
    window.addEventListener("mouseleave", () => cursor.classList.add("is-hidden"));
    window.addEventListener("mouseenter", () => cursor.classList.remove("is-hidden"));
    window.addEventListener("mousedown", () => cursor.classList.add("is-press"));
    window.addEventListener("mouseup", () => cursor.classList.remove("is-press"));

    const HOVER_SEL = 'a, button, [data-hover], .brand-row, .case, .news-card, .service, .header-cta, .submit-btn, .brand-cta';
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(HOVER_SEL)) cursor.classList.add("is-link");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(HOVER_SEL) && !e.relatedTarget?.closest?.(HOVER_SEL))
        cursor.classList.remove("is-link");
    });

    function tick() {
      cx += (mx - cx) * 0.22;
      cy += (my - cy) * 0.22;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    }
    tick();
  } else {
    cursor.remove();
  }

  // ---------- Header stuck on scroll ----------
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 24) header.classList.add("is-stuck");
      else header.classList.remove("is-stuck");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- Reveal observer ----------
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(el => io.observe(el));
  }

  // ---------- Manifesto: word-by-word reveal tied to scroll ----------
  const manifestos = document.querySelectorAll("[data-words]");
  manifestos.forEach((el) => {
    // wrap each word, preserving inline elements like <strong>/<em>
    const wrapNode = (node, parent) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        text.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) {
            parent.appendChild(document.createTextNode(" "));
          } else {
            const s = document.createElement("span");
            s.className = "reveal-word";
            s.textContent = tok;
            parent.appendChild(s);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        Array.from(node.childNodes).forEach((c) => wrapNode(c, clone));
        parent.appendChild(clone);
      }
    };
    const children = Array.from(el.childNodes);
    el.textContent = "";
    children.forEach((c) => wrapNode(c, el));
  });

  const wordEls = Array.from(document.querySelectorAll(".reveal-word"));
  function updateWords() {
    const vh = window.innerHeight;
    wordEls.forEach((w) => {
      const r = w.getBoundingClientRect();
      // become active when the word's center crosses 70% of viewport
      const center = r.top + r.height / 2;
      const t = (vh * 0.72 - center) / (vh * 0.4);
      if (t > 0) w.classList.add("is-active");
      else w.classList.remove("is-active");
    });
  }
  if (wordEls.length) {
    window.addEventListener("scroll", updateWords, { passive: true });
    window.addEventListener("resize", updateWords);
    updateWords();
  }

  // ---------- Magnetic CTA ----------
  // Auto-tag common interactive buttons so the magnetic effect applies broadly.
  const MAGNET_AUTO_SEL = [
    ".button",
    ".submit-btn",
    ".header-cta",
    ".header-cta .button",
    ".brand-cta",
    ".wa-float",
    ".pill",
    ".cta",
    ".more-btn",
    "button.primary",
    "a.primary",
  ].join(",");
  document.querySelectorAll(MAGNET_AUTO_SEL).forEach((el) => {
    if (!el.hasAttribute("data-magnet")) el.setAttribute("data-magnet", "");
  });

  const canHover = !window.matchMedia || window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canHover && !reduced) {
    const magnets = document.querySelectorAll("[data-magnet]");
    magnets.forEach((el) => {
      // Strength scales down for bigger elements so the motion stays subtle.
      const customStrength = parseFloat(el.getAttribute("data-magnet-strength"));
      el.style.transition = el.style.transition || "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.willChange = "transform";

      let raf = 0;
      let tx = 0, ty = 0;

      const apply = () => {
        raf = 0;
        el.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      };

      el.addEventListener("mouseenter", () => {
        el.style.transition = "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)";
      });
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        // Auto strength: smaller buttons pull more, large CTAs less.
        const base = Number.isFinite(customStrength)
          ? customStrength
          : Math.max(0.08, Math.min(0.28, 60 / Math.max(r.width, r.height)));
        tx = x * base;
        ty = y * base * 0.9;
        if (!raf) raf = requestAnimationFrame(apply);
      });
      el.addEventListener("mouseleave", () => {
        tx = 0; ty = 0;
        el.style.transition = "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)";
        el.style.transform = "";
      });
    });
  }

  // ---------- Marquee duplication (clones content so loop is seamless) ----------
  document.querySelectorAll(".marquee__track, .clients-band__track").forEach((tr) => {
    const clone = tr.innerHTML;
    tr.innerHTML = clone + clone;
  });

  // ---------- Parallax for brand-image and hero-noise ----------
  const parallaxEls = document.querySelectorAll("[data-parallax]");
  function onParallax() {
    const y = window.scrollY;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      el.style.transform = `translateY(${y * speed * -1}px)`;
    });
  }
  if (parallaxEls.length) {
    window.addEventListener("scroll", onParallax, { passive: true });
    onParallax();
  }

  // ---------- Live clock for header / footer ----------
  const clockEls = document.querySelectorAll("[data-clock]");
  if (clockEls.length) {
    function tickClock() {
      const now = new Date();
      const opts = { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Rome", hourCycle: "h23" };
      const s = now.toLocaleTimeString("it-IT", opts);
      clockEls.forEach((e) => e.textContent = s);
    }
    tickClock();
    setInterval(tickClock, 1000 * 20);
  }

  // ---------- Smooth scroll for in-page anchors ----------
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    const t = document.getElementById(id);
    if (!t) return;
    e.preventDefault();
    const top = t.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: "smooth" });
  });

})();
