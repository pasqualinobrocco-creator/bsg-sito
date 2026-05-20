import { createFileRoute } from "@tanstack/react-router";
import { EntityManager, type EntityConfig } from "@/components/admin/EntityManager";

const config: EntityConfig = {
  table: "case_histories",
  title: "Case histories",
  newRow: { title: "", slug: "", client: "", year: new Date().getFullYear(), category: "", description: "", content: "", cover_url: "", sort_order: 0, published: false },
  fields: [
    { key: "title", label: "Titolo", required: true },
    { key: "slug", label: "Slug (url)", required: true },
    { key: "client", label: "Cliente" },
    { key: "year", label: "Anno", type: "number" },
    { key: "category", label: "Categoria (es. OOH · BTL)", listColumn: false },
    { key: "description", label: "Descrizione breve", type: "textarea", listColumn: false },
    { key: "content", label: "Contenuto esteso", type: "textarea", listColumn: false },
    { key: "cover_url", label: "URL immagine", type: "url", listColumn: false },
    { key: "sort_order", label: "Ordine", type: "number", listColumn: false },
    { key: "published", label: "Pubblicato", type: "boolean", listColumn: false },
  ],
};

export const Route = createFileRoute("/_authenticated/admin/cases")({
  component: () => <EntityManager config={config} />,
});