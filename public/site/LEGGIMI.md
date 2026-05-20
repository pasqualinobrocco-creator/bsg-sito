# Sito BSG — Centrale Media

Progetto importato dal handoff bundle di Claude Design.

## Contenuto

- **`index.html`** — Homepage (tema dark, editoriale, motion forte)
- **`chi-siamo.html` · `servizi.html` · `portfolio.html` · `news.html` · `contatti.html`** — Pagine interne (tema light, verde BSG)
- **`assets/site.css`** — Stylesheet principale (importa `tokens.css`)
- **`assets/tokens.css`** — Design tokens (colori, tipografia, spaziature)
- **`assets/motion.js`** — Scroll-driven animations, magnetic cursor, parallax
- **`tweaks.js`** — Pannello tweaks (icona toolbar): accent color, velocità marquee, cursore custom
- **`assets/imagery/`** — Foto case history
- **`assets/clients/`** — Loghi clienti
- **`assets/logo/`** — Logotipi del gruppo BSG

## Come avviare il sito in locale

⚠️ Aprire `index.html` con doppio-click (protocollo `file://`) può **non caricare** correttamente il CSS perché `site.css` usa `@import url("./tokens.css")` e alcuni browser bloccano l'import cross-origin in locale.

**Soluzione consigliata**: servirlo via un mini web server locale.

### Opzione 1 — Python (già installato su Mac)

```bash
cd bsg-site
python3 -m http.server 8000
```

Poi apri http://localhost:8000

### Opzione 2 — Node.js (se ce l'hai)

```bash
cd bsg-site
npx serve .
```

### Opzione 3 — VS Code

Installa l'estensione **Live Server**, clicca col destro su `index.html` → "Open with Live Server".

## Sezioni della homepage

1. **Hero** — Titolo tipografico editoriale + 4 stats (35 anni, 4 brand, 2 sedi, 360°)
2. **Marquee** — Banda scorrevole con claims
3. **Manifesto** — Reveal parola-per-parola allo scroll
4. **Universo BSG** — Le 5 anime del gruppo come righe massive (BSG / Padel Best / Padel Media / Squisitus / Excellere)
5. **Servizi** — 4 discipline (Strategia, Crossmedia, OOH, Eventi)
6. **Case history** — 5 lavori recenti
7. **Marquee clienti** — Loghi scorrevoli
8. **News** — Anteprima 3 articoli
9. **Big CTA + Footer**

## Note dal design

- Padel Media ed Excellere hanno descrizioni placeholder — da rivedere col team
- I numeri delle case history sono illustrativi
- Le foto case history vanno sostituite con quelle ufficiali del company profile

## Prossimi passi suggeriti

- [ ] Sostituire copy e numeri reali nelle case history
- [ ] Definire posizionamento di Padel Media ed Excellere
- [ ] Integrare un CMS headless (es. Sanity, Strapi) per news/comunicati/campagne
- [ ] Ottimizzare immagini (WebP) e lazy loading
- [ ] SEO meta tag e Open Graph per ogni pagina
- [ ] Aggiungere form contatti funzionante (es. Formspree o backend dedicato)
- [ ] Accessibilità: contrasti AA, focus states, ridotto motion per `prefers-reduced-motion`
