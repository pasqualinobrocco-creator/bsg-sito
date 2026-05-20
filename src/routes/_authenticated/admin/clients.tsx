import { createFileRoute } from "@tanstack/react-router";
import { EntityManager, type EntityConfig } from "@/components/admin/EntityManager";

const config: EntityConfig = {
  table: "clients",
  title: "Clienti",
  newRow: { name: "", logo_url: "", sort_order: 0, published: true },
  fields: [
    { key: "name", label: "Nome", required: true },
    { key: "logo_url", label: "URL logo", type: "url" },
    { key: "sort_order", label: "Ordine", type: "number" },
    { key: "published", label: "Pubblicato", type: "boolean", listColumn: false },
  ],
};

export const Route = createFileRoute("/_authenticated/admin/clients")({
  component: () => <EntityManager config={config} />,
});