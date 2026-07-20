#!/bin/bash
# BSG — installazione sito su Aruba Cloud VPS (Ubuntu 24.04)
# Uso: bash deploy.sh
set -u
BASE="https://bsg-sito.lovable.app"
DOCROOT=/var/www/bsg
LOG=/root/bsg-deploy.log
exec > >(tee -a "$LOG") 2>&1
echo "== BSG deploy start: $(date) =="

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx curl python3 certbot python3-certbot-nginx

mkdir -p "$DOCROOT/favicons" "$DOCROOT/assets"

FILES="
favicons/android-chrome-192x192.png
favicons/android-chrome-512x512.png
favicons/apple-touch-icon.png
favicons/favicon-16x16.png
favicons/favicon-32x32.png
favicons/favicon-48x48.png
favicons/favicon.ico
favicons/favicon.svg
favicons/site.webmanifest
site/assets/brand-logos/excellere.svg
site/assets/brand-logos/padel-best.png
site/assets/brand-logos/padel-media-communication.svg
site/assets/brand-logos/squisitus.png
site/assets/clients/bcc-banca-pesaro.jpg
site/assets/clients/bcc-binasco.jpg
site/assets/clients/bcc-emilbanca.jpg
site/assets/clients/bcc-garda.jpg
site/assets/clients/bcc-roma.jpg
site/assets/clients/bcc-vicentino.jpg
site/assets/clients/boomerang.jpg
site/assets/clients/caffe-trombetta.jpg
site/assets/clients/calia-italia.jpg
site/assets/clients/casaidea.jpg
site/assets/clients/cirque-du-soleil.jpg
site/assets/clients/cisalfa.jpg
site/assets/clients/compagnia-italiana.jpg
site/assets/clients/crik-crok.jpg
site/assets/clients/cts-supermercati.jpg
site/assets/clients/divanidea.jpg
site/assets/clients/essilor.jpg
site/assets/clients/finstral.jpg
site/assets/clients/gros.jpg
site/assets/clients/gruppo-bcc-iccrea.jpg
site/assets/clients/iper-triscount.jpg
site/assets/clients/lama-optical.jpg
site/assets/clients/live-nation.jpg
site/assets/clients/maurys.jpg
site/assets/clients/mcdonalds.jpg
site/assets/clients/mila.jpg
site/assets/clients/moacasa.jpg
site/assets/clients/naima.jpg
site/assets/clients/parah.jpg
site/assets/clients/rds.jpg
site/assets/clients/regione-lazio.jpg
site/assets/clients/roche-bobois.jpg
site/assets/clients/sandro-ferrone.jpg
site/assets/clients/tim.jpg
site/assets/clients/verisure.jpg
site/assets/cookie-consent.js
site/assets/imagery/case-bcc-iccrea.jpg
site/assets/imagery/case-caffe-trombetta.jpg
site/assets/imagery/case-finstral-bus.jpg
site/assets/imagery/case-finstral.jpg
site/assets/imagery/case-gros-maestri.jpg
site/assets/imagery/case-gros.jpg
site/assets/imagery/case-quirino.jpg
site/assets/imagery/case-rds-billboard.jpg
site/assets/imagery/case-rds-tour.jpg
site/assets/imagery/case-rds.jpg
site/assets/imagery/case-regione-lazio.jpg
site/assets/imagery/case-sandro.jpg
site/assets/imagery/case-trombetta.jpg
site/assets/imagery/company-profile-p20.jpg
site/assets/imagery/format-proprietari.jpg
site/assets/imagery/key-puzzle.jpg
site/assets/imagery/moodboard-atl.jpg
site/assets/imagery/ooh-strada.jpg
site/assets/imagery/portfolio-bcc-iccrea.jpg
site/assets/imagery/portfolio-bcc-roma.jpg
site/assets/imagery/portfolio-boomerang.jpg
site/assets/imagery/portfolio-caffe-trombetta.jpg
site/assets/imagery/portfolio-cartoon-network.jpg
site/assets/imagery/portfolio-cirque-du-soleil.jpg
site/assets/imagery/portfolio-essilor-varilux.jpg
site/assets/imagery/portfolio-finstral.jpg
site/assets/imagery/portfolio-gros-maestri-del-fresco.jpg
site/assets/imagery/portfolio-live-nation.jpg
site/assets/imagery/portfolio-mila.jpg
site/assets/imagery/portfolio-naima.jpg
site/assets/imagery/portfolio-placeholder.svg
site/assets/imagery/portfolio-rds.jpg
site/assets/imagery/portfolio-regione-lazio.jpg
site/assets/imagery/portfolio-sandro-ferrone.jpg
site/assets/imagery/portfolio-tim.jpg
site/assets/imagery/portfolio-udisens.jpg
site/assets/imagery/portfolio-verisure.jpg
site/assets/logo/bsg-mark.svg
site/assets/logo/bsg-wordmark-white.svg
site/assets/logo/bsg-wordmark.svg
site/assets/logo/padel-best-village.svg
site/assets/logo/squisitus.svg
site/assets/motion.js
site/assets/news-data.js
site/assets/site.css
site/assets/tokens.css
site/chi-siamo.html
site/contatti.html
site/cookie.html
site/index.html
site/news.html
site/portfolio.html
site/privacy.html
site/robots.txt
site/servizi.html
site/shop.html
site/sitemap.xml
site/tweaks.js
site/universo.html
"

FAILED=0
for p in $FILES; do
  case "$p" in
    site/*) out="$DOCROOT/${p#site/}" ;;
    *)      out="$DOCROOT/$p" ;;
  esac
  mkdir -p "$(dirname "$out")"
  if ! curl -fsSL --retry 3 "$BASE/$p" -o "$out"; then
    echo "WARN: download fallito: $p"
    FAILED=$((FAILED+1))
  fi
done
echo "Download completati (falliti: $FAILED)"

# Correzioni percorsi per il deployment alla radice del dominio
sed -i 's#/site/#/#g' "$DOCROOT/sitemap.xml" "$DOCROOT/robots.txt" || true
find "$DOCROOT" -maxdepth 2 -type f \( -name '*.html' -o -name '*.css' -o -name '*.js' \) \
  -exec sed -i 's#"/__l5e/#"https://bsg-sito.lovable.app/__l5e/#g' {} +

# Configurazione Nginx
if grep -q letsencrypt /etc/nginx/sites-available/bsg 2>/dev/null; then
  echo "Config Nginx con SSL gia' presente: non modificata"
  systemctl reload nginx || true
else
  cat > /etc/nginx/sites-available/bsg <<'NGX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name bsgsrl.it www.bsgsrl.it bsgsrl.com www.bsgsrl.com _;
    root /var/www/bsg;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ =404;
    }

    location ~* \.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff2?)$ {
        expires 7d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    gzip on;
    gzip_types text/css application/javascript image/svg+xml text/plain application/json text/html;
}
NGX
  rm -f /etc/nginx/sites-enabled/default
  ln -sf /etc/nginx/sites-available/bsg /etc/nginx/sites-enabled/bsg
  nginx -t && systemctl enable nginx && systemctl restart nginx
fi

# ---- Sincronizzazione news dal database (API Lovable/Supabase) ----
cat > /usr/local/bin/bsg-news-sync <<'PYEOF'
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sincronizza le news dal database (API pubblica) nel file statico del sito.
Le news storiche restano come base; quelle del database vengono aggiunte sopra."""
import json, urllib.request

API = "https://bsg-sito.lovable.app/api/public/news"
OUT = "/var/www/bsg/assets/news-data.js"

BASE = [
  {"title": "Tutto pronto per Casaidea 2026: un'immersione gratuita tra tendenze e innovazione", "date": "2026-05-26", "category": "Comunicato", "excerpt": "Torna l'appuntamento con Casaidea: dieci giorni di tendenze, innovazione e nuovi linguaggi dell'abitare, con ingresso gratuito.", "image": "https://bsg-sito.lovable.app/__l5e/assets-v1/13225cad-0b47-4be8-9949-14d6ab115e14/casaidea-2026.jpg", "url": "https://mediakey.it/news/tutto-pronto-per-casaidea-2026-unimmersione-gratuita-tra-tendenze-e-innovazione/"},
  {"title": "BSG firma la nuova campagna integrata 'Gratta & Parti in Europa' per Caffè Trombetta", "date": "2026-04-18", "category": "Campagna", "excerpt": "Una promozione cross-mediale che porta i consumatori a vincere viaggi in tutta Europa, con creatività e pianificazione media a cura di BSG.", "url": "https://www.adcgroup.it/adv-express/creative-portfolio/integrated/bsg-firma-la-nuova-campagna-integrata-gratta-parti-in-europa-per-caffe-trombetta.html"},
  {"title": "Importanti risultati a MARCA per il lancio di Squisitus", "date": "2026-01-22", "category": "Comunicato", "excerpt": "Il debutto di Squisitus alla fiera MARCA di Bologna conferma l'interesse di buyer e produttori per il nuovo format firmato BSG.", "url": "https://www.eroidelgusto.it/importanti-risultati-a-marca-per-il-lancio-di-squisitus/"},
  {"title": "BSG Comunicazione & Marketing firma la campagna media per i 50 anni di MoaCasa", "date": "2025-10-14", "category": "Campagna", "excerpt": "Pianificazione cross-mediale e creatività dedicata per celebrare mezzo secolo della fiera dell'arredo e del design.", "url": "https://mediakey.it/news/bsg-comunicazione-e-marketing-firma-la-campagna-media-per-i-50-anni-di-moacasa/"},
  {"title": "Gruppo BCC Iccrea lancia la sua nuova campagna istituzionale", "date": "2025-09-25", "category": "Campagna", "excerpt": "Una nuova narrazione per il più grande gruppo bancario cooperativo italiano, con pianificazione affidata a BSG.", "url": "https://www.engage.it/campagne/pubblicita-gruppo-bcc-iccrea-lancia-la-sua-nuova-campagna-istituzionale-firma-mccann-worldgroup-italia.aspx"},
  {"title": "Padel Best Village al Grimaldi Forum di Monte Carlo: un successo tra sport e business", "date": "2025-04-30", "category": "Comunicato", "excerpt": "Il format esperienziale di BSG sbarca a Monte Carlo: tre giorni di tornei, networking e brand experience nel cuore del Principato.", "url": "https://www.tuttosport.com/news/altri-sport/2025/04/30-140348586/padel_best_village_al_grimaldi_forum_di_monte_carlo_un_successo_tra_sport_e_business"},
  {"title": "BSG Srl avvia una campagna advertising per BCC di Pesaro", "date": "2025-03-12", "category": "Campagna", "excerpt": "Nuova campagna territoriale a sostegno della banca di credito cooperativo di Pesaro, con un mix integrato di media locali.", "url": "https://mediakey.it/news/bsg-srl-avvia-una-campagna-advertising-per-bcc-di-pesaro/"},
  {"title": "Caffè Trombetta lancia il concorso 'L'espresso in bicicletta'. Creatività e pianificazione media a cura di BSG Srl", "date": "2024-11-05", "category": "Campagna", "excerpt": "Un concorso che unisce gusto e sostenibilità: e-bike in palio per i consumatori, con regia creativa e media firmata BSG.", "url": "https://mediakey.it/news/caffe-trombetta-lancia-il-concorso-lespresso-in-bicicletta-creativita-e-pianificazione-media-a-cura-bsg-srl/"},
]

def fetch_api():
    try:
        req = urllib.request.Request(API, headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) BSGNewsSync/1.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = json.load(r)
        out = []
        for n in data.get("news") or []:
            if not n.get("title"):
                continue
            item = {
                "title": n["title"],
                "date": (n.get("published_at") or "")[:10],
                "category": n.get("category") or "News",
                "excerpt": n.get("excerpt") or "",
                "url": "https://bsg-sito.lovable.app/news/" + (n.get("slug") or ""),
            }
            if n.get("cover_url"):
                cu = n["cover_url"]
                if cu.startswith("/site/"):
                    cu = cu[5:]
                elif cu.startswith("/"):
                    cu = "https://bsg-sito.lovable.app" + cu
                item["image"] = cu
            out.append(item)
        return out
    except Exception as e:
        print("API non raggiungibile:", e)
        return []

api_items = fetch_api()
seen, merged = set(), []
for n in api_items + BASE:
    key = n["title"].strip().lower()
    if key in seen:
        continue
    seen.add(key)
    merged.append(n)
merged.sort(key=lambda n: n.get("date") or "", reverse=True)

entries = json.dumps(merged, ensure_ascii=False, indent=2)
js = """/*
 * BSG News — file generato automaticamente (sync dal database ogni 10 minuti).
 * NON modificare a mano: le modifiche verranno sovrascritte.
 * Gli articoli si gestiscono dalla dashboard admin (Lovable).
 */
(function (root) {
  root.BSG_NEWS = @ENTRIES@;

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
""".replace("@ENTRIES@", entries)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(js)
print("news-data.js aggiornato: %d articoli (%d dal database)" % (len(merged), len(api_items)))
PYEOF
chmod +x /usr/local/bin/bsg-news-sync
echo '*/10 * * * * root /usr/local/bin/bsg-news-sync >/dev/null 2>&1' > /etc/cron.d/bsg-news-sync
chmod 644 /etc/cron.d/bsg-news-sync
/usr/local/bin/bsg-news-sync || true

# ---- Script per attivare HTTPS quando il DNS punta al server (da lanciare manualmente) ----
cat > /usr/local/bin/bsg-https <<'HTTPSEOF'
#!/bin/bash
# Attiva HTTPS con Let's Encrypt per bsgsrl.com (lanciare SOLO quando il DNS punta a questo server)
certbot --nginx -d bsgsrl.com -d www.bsgsrl.com --redirect -m amministrazione@juicewebagency.it --agree-tos --no-eff-email
HTTPSEOF
chmod +x /usr/local/bin/bsg-https

echo "== BSG deploy completato: $(date) =="
echo "Sito disponibile su: http://$(curl -s -4 ifconfig.me || hostname -I | awk '{print $1}')/"
