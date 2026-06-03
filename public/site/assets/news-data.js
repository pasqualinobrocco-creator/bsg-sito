/*
 * BSG News — single source of truth.
 *
 * Add new articles at the TOP of the array (most recent first).
 * The homepage shows the first 3 entries; /news shows the full list.
 * Each item: { title, date (ISO YYYY-MM-DD), excerpt, category, url }
 * `url` is the external article — opens in a new tab.
 */
(function (root) {
  root.BSG_NEWS = [
    {
      title: "Tutto pronto per Casaidea 2026: un'immersione gratuita tra tendenze e innovazione",
      date: "2026-05-26",
      category: "Comunicato",
      excerpt: "Torna l'appuntamento con Casaidea: dieci giorni di tendenze, innovazione e nuovi linguaggi dell'abitare, con ingresso gratuito.",
      image: "/__l5e/assets-v1/13225cad-0b47-4be8-9949-14d6ab115e14/casaidea-2026.jpg",
      url: "https://mediakey.it/news/tutto-pronto-per-casaidea-2026-unimmersione-gratuita-tra-tendenze-e-innovazione/"
    },
    {
      title: "BSG firma la nuova campagna integrata \u2018Gratta & Parti in Europa\u2019 per Caff\u00e8 Trombetta",
      date: "2026-04-18",
      category: "Campagna",
      excerpt: "Una promozione cross-mediale che porta i consumatori a vincere viaggi in tutta Europa, con creativit\u00e0 e pianificazione media a cura di BSG.",
      url: "https://www.adcgroup.it/adv-express/creative-portfolio/integrated/bsg-firma-la-nuova-campagna-integrata-gratta-parti-in-europa-per-caffe-trombetta.html"
    },
    {
      title: "Importanti risultati a MARCA per il lancio di Squisitus",
      date: "2026-01-22",
      category: "Comunicato",
      excerpt: "Il debutto di Squisitus alla fiera MARCA di Bologna conferma l'interesse di buyer e produttori per il nuovo format firmato BSG.",
      url: "https://www.eroidelgusto.it/importanti-risultati-a-marca-per-il-lancio-di-squisitus/"
    },
    {
      title: "BSG Comunicazione & Marketing firma la campagna media per i 50 anni di MoaCasa",
      date: "2025-10-14",
      category: "Campagna",
      excerpt: "Pianificazione cross-mediale e creativit\u00e0 dedicata per celebrare mezzo secolo della fiera dell'arredo e del design.",
      url: "https://mediakey.it/news/bsg-comunicazione-e-marketing-firma-la-campagna-media-per-i-50-anni-di-moacasa/"
    },
    {
      title: "Gruppo BCC Iccrea lancia la sua nuova campagna istituzionale",
      date: "2025-09-25",
      category: "Campagna",
      excerpt: "Una nuova narrazione per il pi\u00f9 grande gruppo bancario cooperativo italiano, con pianificazione affidata a BSG.",
      url: "https://www.engage.it/campagne/pubblicita-gruppo-bcc-iccrea-lancia-la-sua-nuova-campagna-istituzionale-firma-mccann-worldgroup-italia.aspx"
    },
    {
      title: "Padel Best Village al Grimaldi Forum di Monte Carlo: un successo tra sport e business",
      date: "2025-04-30",
      category: "Comunicato",
      excerpt: "Il format esperienziale di BSG sbarca a Monte Carlo: tre giorni di tornei, networking e brand experience nel cuore del Principato.",
      url: "https://www.tuttosport.com/news/altri-sport/2025/04/30-140348586/padel_best_village_al_grimaldi_forum_di_monte_carlo_un_successo_tra_sport_e_business"
    },
    {
      title: "BSG Srl avvia una campagna advertising per BCC di Pesaro",
      date: "2025-03-12",
      category: "Campagna",
      excerpt: "Nuova campagna territoriale a sostegno della banca di credito cooperativo di Pesaro, con un mix integrato di media locali.",
      url: "https://mediakey.it/news/bsg-srl-avvia-una-campagna-advertising-per-bcc-di-pesaro/"
    },
    {
      title: "Caff\u00e8 Trombetta lancia il concorso \u2018L\u2019espresso in bicicletta\u2019. Creativit\u00e0 e pianificazione media a cura di BSG Srl",
      date: "2024-11-05",
      category: "Campagna",
      excerpt: "Un concorso che unisce gusto e sostenibilit\u00e0: e-bike in palio per i consumatori, con regia creativa e media firmata BSG.",
      url: "https://mediakey.it/news/caffe-trombetta-lancia-il-concorso-lespresso-in-bicicletta-creativita-e-pianificazione-media-a-cura-bsg-srl/"
    }
  ];

  // Always sorted: newest first (defensive — in case items are appended out of order).
  root.BSG_NEWS.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });

  var MONTHS_FULL  = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  var MONTHS_SHORT = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic'];
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  root.BSG_NEWS_FMT = {
    full: function (iso) {
      var d = new Date(iso); if (isNaN(d)) return '';
      return pad(d.getDate()) + ' ' + MONTHS_FULL[d.getMonth()] + ' ' + d.getFullYear();
    },
    short: function (iso) {
      var d = new Date(iso); if (isNaN(d)) return '';
      return pad(d.getDate()) + ' ' + MONTHS_SHORT[d.getMonth()] + ' ' + d.getFullYear();
    }
  };
})(window);