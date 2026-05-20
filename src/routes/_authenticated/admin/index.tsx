import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminList } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Card({ to, label, count }: { to: string; label: string; count?: number }) {
  return (
    <Link to={to} style={{
      display: "block", padding: 24, background: "#fff", borderRadius: 12,
      textDecoration: "none", border: "1px solid #E3E3E3",
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "#706F6F" }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 900, color: "#1A1A1A", marginTop: 4 }}>{count ?? "—"}</div>
    </Link>
  );
}

function useCount(table: any) {
  const fn = useServerFn(adminList);
  const q = useQuery({ queryKey: ["admin", table], queryFn: () => fn({ data: { table } }) });
  return q.data?.rows.length;
}

function Dashboard() {
  const news = useCount("news");
  const cases = useCount("case_histories");
  const services = useCount("services");
  const clients = useCount("clients");
  const messages = useCount("contact_messages");
  return (
    <div>
      <h1 style={{ margin: "0 0 8px", fontSize: 32, fontWeight: 900, color: "#1A1A1A" }}>Dashboard</h1>
      <p style={{ margin: "0 0 32px", color: "#706F6F" }}>Gestisci i contenuti del sito BSG.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
        <Card to="/admin/news" label="News" count={news} />
        <Card to="/admin/cases" label="Case histories" count={cases} />
        <Card to="/admin/services" label="Servizi" count={services} />
        <Card to="/admin/clients" label="Clienti" count={clients} />
        <Card to="/admin/messages" label="Messaggi" count={messages} />
      </div>
    </div>
  );
}