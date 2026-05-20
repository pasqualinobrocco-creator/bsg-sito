import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole, claimFirstAdmin } from "@/lib/admin.functions";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin · BSG" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const getRole = useServerFn(getMyRole);
  const claim = useServerFn(claimFirstAdmin);
  const [claiming, setClaiming] = useState(false);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-role"],
    queryFn: () => getRole(),
  });

  const path = useRouterState({ select: (s) => s.location.pathname });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await claim();
      await refetch();
    } catch (e: any) {
      alert(e?.message ?? "Errore");
    } finally {
      setClaiming(false);
    }
  };

  if (isLoading) {
    return <div style={s.loading}>Caricamento…</div>;
  }

  if (!data?.isAdmin) {
    return (
      <div style={s.noAdminShell}>
        <div style={s.noAdminCard}>
          <h1 style={{ margin: "0 0 8px", fontSize: 24 }}>Nessun ruolo admin</h1>
          <p style={{ margin: "0 0 20px", color: "#706F6F" }}>
            Il tuo account non ha permessi di amministratore. Se sei il primo
            utente registrato, puoi rivendicare il ruolo admin.
          </p>
          <button onClick={handleClaim} disabled={claiming} style={s.primaryBtn}>
            {claiming ? "…" : "Rivendica ruolo admin"}
          </button>
          <button onClick={signOut} style={s.linkBtn}>Esci</button>
        </div>
      </div>
    );
  }

  const items: { to: string; label: string }[] = [
    { to: "/admin", label: "Dashboard" },
    { to: "/admin/news", label: "News" },
    { to: "/admin/cases", label: "Case histories" },
    { to: "/admin/services", label: "Servizi" },
    { to: "/admin/clients", label: "Clienti" },
    { to: "/admin/messages", label: "Messaggi" },
  ];

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        <Link to="/" style={s.brand}>
          bsg<span style={{ color: "#639730" }}>.</span>
          <span style={s.brandMeta}>admin</span>
        </Link>
        <nav style={s.nav}>
          {items.map((it) => {
            const active =
              it.to === "/admin"
                ? path === "/admin"
                : path.startsWith(it.to);
            return (
              <Link
                key={it.to}
                to={it.to}
                style={{ ...s.navItem, ...(active ? s.navItemActive : {}) }}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ marginTop: "auto", display: "grid", gap: 8 }}>
          <a href="/site/index.html" target="_blank" rel="noreferrer" style={s.outBtn}>
            Vedi il sito ↗
          </a>
          <button onClick={signOut} style={s.outBtn}>Esci</button>
        </div>
      </aside>
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  loading: { padding: 40, fontFamily: "system-ui, sans-serif" },
  noAdminShell: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#F6F6F6",
    padding: 24,
    fontFamily: "system-ui, sans-serif",
  },
  noAdminCard: {
    background: "#fff",
    padding: 32,
    borderRadius: 16,
    maxWidth: 420,
    boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
    display: "grid",
    gap: 8,
  },
  primaryBtn: {
    padding: "12px 20px",
    background: "#639730",
    color: "#0A0D08",
    border: "none",
    borderRadius: 999,
    fontWeight: 700,
    cursor: "pointer",
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#706F6F",
    cursor: "pointer",
    marginTop: 8,
    fontSize: 13,
  },
  shell: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "260px 1fr",
    fontFamily: "system-ui, -apple-system, sans-serif",
    background: "#F6F6F6",
  },
  sidebar: {
    background: "#0A0D08",
    color: "#fff",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    position: "sticky",
    top: 0,
    height: "100vh",
  },
  brand: {
    fontFamily: "Poppins, system-ui, sans-serif",
    fontWeight: 900,
    fontSize: 24,
    color: "#fff",
    textDecoration: "none",
    letterSpacing: "-0.04em",
    display: "flex",
    alignItems: "baseline",
    gap: 8,
  },
  brandMeta: {
    fontSize: 11,
    fontWeight: 400,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#878787",
  },
  nav: { display: "grid", gap: 4 },
  navItem: {
    padding: "10px 12px",
    color: "#C6C6C6",
    textDecoration: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
  },
  navItemActive: {
    background: "#639730",
    color: "#0A0D08",
    fontWeight: 700,
  },
  outBtn: {
    padding: "10px 12px",
    background: "transparent",
    border: "1px solid #3C3C3B",
    color: "#C6C6C6",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    textAlign: "center",
    textDecoration: "none",
    fontFamily: "inherit",
  },
  main: { padding: "32px 40px", maxWidth: 1400, width: "100%" },
};