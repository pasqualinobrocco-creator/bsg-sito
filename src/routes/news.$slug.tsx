import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { marked } from "marked";
import { getPublishedNewsBySlug } from "@/lib/news.functions";

export const Route = createFileRoute("/news/$slug")({
  loader: async ({ params }) => {
    const { news } = await getPublishedNewsBySlug({ data: { slug: params.slug } });
    if (!news) throw notFound();
    return { news };
  },
  head: ({ loaderData }) => {
    const n = loaderData?.news;
    const title = n ? `${n.title} · BSG News` : "BSG News";
    const desc = n?.excerpt ?? "News e comunicati BSG.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...(n?.cover_url ? [{ property: "og:image", content: n.cover_url }] : []),
      ],
      links: [
        { rel: "stylesheet", href: "/site/assets/tokens.css" },
        { rel: "stylesheet", href: "/site/assets/site.css" },
        { rel: "icon", type: "image/svg+xml", href: "/favicons/favicon.svg" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/favicons/apple-touch-icon.png" },
      ],
    };
  },
  component: NewsArticle,
  notFoundComponent: () => (
    <div style={{ padding: 80, textAlign: "center", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 48, margin: 0 }}>Articolo non trovato</h1>
      <p style={{ color: "#706F6F", marginTop: 12 }}>
        L'articolo che stai cercando non è disponibile o è stato rimosso.
      </p>
      <p style={{ marginTop: 24 }}>
        <a href="/site/news.html" style={{ color: "#639730", fontWeight: 700 }}>
          ← Torna a tutte le news
        </a>
      </p>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div style={{ padding: 80, textAlign: "center", fontFamily: "system-ui" }}>
      <h1>Errore nel caricamento</h1>
      <p style={{ color: "#706F6F" }}>{error.message}</p>
      <p><a href="/site/news.html">← Torna alle news</a></p>
    </div>
  ),
});

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "long", year: "numeric" });
}

function NewsArticle() {
  const { news } = Route.useLoaderData();
  const html = marked.parse(news.content ?? news.excerpt ?? "", { async: false }) as string;

  return (
    <>
      <header className="site-header">
        <a className="brand" href="/site/index.html" aria-label="BSG home">
          <img className="brand-logo" src="/site/assets/logo/bsg-mark.svg" alt="BSG" width={40} height={40} />
          <span className="brand-meta">Centrale media · dal 1991</span>
        </a>
        <nav className="site-nav" aria-label="Navigazione principale">
          <a href="/site/chi-siamo.html">Chi siamo</a>
          <a href="/site/servizi.html">Servizi</a>
          <a href="/site/index.html#universo">Universo BSG</a>
          <a href="/site/portfolio.html">Portfolio</a>
          <a href="/site/news.html" className="is-current">News</a>
        </nav>
        <a className="header-cta" href="/site/contatti.html">
          <span>Parliamone</span>
        </a>
      </header>

      <main>
        <article className="section news-detail">
          <div className="wrap" style={{ maxWidth: 880 }}>
            <div className="crumbs" style={{ marginBottom: 32 }}>
              <a href="/site/index.html">Home</a> <span className="sep">/</span>{" "}
              <a href="/site/news.html">News</a> <span className="sep">/</span>{" "}
              <span className="current">{news.title}</span>
            </div>

            {news.category && (
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: "var(--bsg-green-100)",
                  color: "var(--bsg-green-deep)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {news.category}
              </span>
            )}

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "clamp(34px, 5vw, 64px)",
                lineHeight: 1.05,
                letterSpacing: "-0.025em",
                margin: "20px 0 24px",
              }}
            >
              {news.title}
            </h1>

            <div
              style={{
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
                color: "var(--fg-muted)",
                fontSize: 14,
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                marginBottom: 40,
                paddingBottom: 32,
                borderBottom: "1px solid var(--border-default)",
              }}
            >
              <span>{formatDate(news.published_at)}</span>
              {news.author && <span>di {news.author}</span>}
            </div>

            {news.cover_url && (
              <div
                style={{
                  marginBottom: 48,
                  borderRadius: "var(--radius-xl, 24px)",
                  overflow: "hidden",
                  aspectRatio: "16 / 9",
                  backgroundImage: `url('${news.cover_url}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            )}

            {news.excerpt && (
              <p
                style={{
                  fontSize: 22,
                  lineHeight: 1.5,
                  color: "var(--fg-default)",
                  fontWeight: 500,
                  marginBottom: 40,
                  fontFamily: "var(--font-display)",
                }}
              >
                {news.excerpt}
              </p>
            )}

            <div
              className="news-article-body"
              style={{
                fontSize: 18,
                lineHeight: 1.7,
                color: "var(--fg-default)",
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />

            <div style={{ marginTop: 80, paddingTop: 32, borderTop: "1px solid var(--border-default)" }}>
              <a
                href="/site/news.html"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--bsg-green-500)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                ← Torna a tutte le news
              </a>
            </div>
          </div>
        </article>
      </main>

      <style>{`
        .news-article-body h2 { font-family: var(--font-display); font-weight: 800; font-size: 28px; margin: 48px 0 16px; letter-spacing: -0.01em; }
        .news-article-body h3 { font-family: var(--font-display); font-weight: 700; font-size: 22px; margin: 36px 0 12px; }
        .news-article-body p { margin: 0 0 20px; }
        .news-article-body ul, .news-article-body ol { margin: 0 0 24px; padding-left: 24px; }
        .news-article-body li { margin-bottom: 8px; }
        .news-article-body blockquote { border-left: 4px solid var(--bsg-green-500); padding: 8px 0 8px 24px; margin: 32px 0; font-family: var(--font-display); font-weight: 600; font-size: 22px; line-height: 1.4; color: var(--fg-default); }
        .news-article-body strong { font-weight: 700; }
        .news-article-body a { color: var(--bsg-green-500); text-decoration: underline; }
      `}</style>
    </>
  );
}