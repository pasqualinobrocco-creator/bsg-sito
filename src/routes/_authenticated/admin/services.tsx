import { createFileRoute } from "@tanstack/react-router";
import { EntityManager, type EntityConfig } from "@/components/admin/EntityManager";

const config: EntityConfig = {
  table: "services",
  title: "Servizi",
  newRow: { title: "", description: "", icon: "", sort_order: 0, published: true },
  fields: [
    { key: "title", label: "Titolo", required: true },
    { key: "description", label: "Descrizione", type: "textarea" },
    { key: "icon", label: "Icona (es. nome lucide)" },
    { key: "sort_order", label: "Ordine", type: "number" },
    { key: "published", label: "Pubblicato", type: "boolean", listColumn: false },
  ],
};

export const Route = createFileRoute("/_authenticated/admin/services")({
  component: () => <EntityManager config={config} />,
});