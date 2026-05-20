import { createFileRoute } from "@tanstack/react-router";
import { EntityManager, type EntityConfig } from "@/components/admin/EntityManager";

const config: EntityConfig = {
  table: "news",
  title: "News",
  newRow: { title: "", slug: "", excerpt: "", content: "", cover_url: "", category: "", author: "", published: false, published_at: null },
  fields: [
    { key: "title", label: "Titolo", required: true },
    { key: "slug", label: "Slug (url)", required: true },
    { key: "category", label: "Categoria" },
    { key: "author", label: "Autore" },
    { key: "excerpt", label: "Estratto", type: "textarea", listColumn: false },
    { key: "content", label: "Contenuto (markdown)", type: "textarea", listColumn: false },
    { key: "cover_url", label: "URL immagine copertina", type: "url", listColumn: false },
    { key: "published_at", label: "Data pubblicazione", type: "date", listColumn: false },
    { key: "published", label: "Pubblicato", type: "boolean", listColumn: false },
  ],
};

export const Route = createFileRoute("/_authenticated/admin/news")({
  component: () => <EntityManager config={config} />,
});