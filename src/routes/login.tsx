import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Accesso · BSG admin" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        setInfo("Account creato. Controlla la mail per confermare, poi accedi.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      setError(err?.message ?? "Errore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.card}>
        <Link to="/" style={styles.brand}>
          bsg<span style={{ color: "#639730" }}>.</span>
        </Link>
        <h1 style={styles.h1}>{mode === "signin" ? "Accedi" : "Crea account"}</h1>
        <p style={styles.sub}>Pannello redazione BSG</p>

        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              autoComplete="email"
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </label>

          {error && <div style={styles.err}>{error}</div>}
          {info && <div style={styles.info}>{info}</div>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "…" : mode === "signin" ? "Accedi" : "Registrati"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setInfo(null);
            setMode(mode === "signin" ? "signup" : "signin");
          }}
          style={styles.switch}
        >
          {mode === "signin" ? "Non hai un account? Registrati" : "Hai già un account? Accedi"}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#0A0D08",
    padding: 24,
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  brand: {
    display: "inline-block",
    fontFamily: "Poppins, system-ui, sans-serif",
    fontWeight: 900,
    fontSize: 28,
    color: "#1A1A1A",
    letterSpacing: "-0.04em",
    textDecoration: "none",
    marginBottom: 24,
  },
  h1: { margin: "0 0 4px", fontSize: 28, fontWeight: 800, color: "#1A1A1A" },
  sub: { margin: "0 0 28px", color: "#706F6F", fontSize: 14 },
  form: { display: "grid", gap: 16 },
  label: { display: "grid", gap: 6, fontSize: 13, color: "#3C3C3B", fontWeight: 600 },
  input: {
    padding: "12px 14px",
    border: "1px solid #E3E3E3",
    borderRadius: 8,
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
  },
  btn: {
    padding: "14px 20px",
    background: "#639730",
    color: "#0A0D08",
    border: "none",
    borderRadius: 999,
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
    marginTop: 8,
  },
  switch: {
    marginTop: 20,
    width: "100%",
    background: "transparent",
    border: "none",
    color: "#639730",
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 600,
  },
  err: {
    padding: "10px 12px",
    background: "#FEE",
    color: "#A5143B",
    borderRadius: 6,
    fontSize: 13,
  },
  info: {
    padding: "10px 12px",
    background: "#E3E8D5",
    color: "#106B30",
    borderRadius: 6,
    fontSize: 13,
  },
};