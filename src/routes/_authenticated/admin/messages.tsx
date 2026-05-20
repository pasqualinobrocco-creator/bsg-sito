import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { adminList, adminDelete, adminMarkMessageRead } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: Messages,
});

function Messages() {
  const qc = useQueryClient();
  const listFn = useServerFn(adminList);
  const delFn = useServerFn(adminDelete);
  const markFn = useServerFn(adminMarkMessageRead);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "contact_messages"],
    queryFn: () => listFn({ data: { table: "contact_messages" } }),
  });
  const mark = useMutation({
    mutationFn: (v: { id: string; read: boolean }) => markFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "contact_messages"] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { table: "contact_messages", id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "contact_messages"] }),
  });

  return (
    <div>
      <h1 style={{ margin: "0 0 24px", fontSize: 28, fontWeight: 800 }}>Messaggi dal form contatti</h1>
      {isLoading ? <p>Caricamento…</p> : (
        <div style={{ display: "grid", gap: 12 }}>
          {(data?.rows ?? []).length === 0 && (
            <p style={{ color: "#878787" }}>Nessun messaggio ricevuto.</p>
          )}
          {(data?.rows ?? []).map((m: any) => (
            <article key={m.id} style={{
              background: "#fff", borderRadius: 12, padding: 20,
              border: "1px solid " + (m.read ? "#E3E3E3" : "#639730"),
            }}>
              <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
                <div>
                  <strong style={{ fontSize: 16 }}>{m.name}</strong>
                  {m.company && <span style={{ color: "#706F6F" }}> · {m.company}</span>}
                  <div style={{ fontSize: 13, color: "#706F6F" }}>
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                    {m.phone && <> · {m.phone}</>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#878787" }}>
                    {new Date(m.created_at).toLocaleString("it-IT")}
                  </span>
                  <button
                    onClick={() => mark.mutate({ id: m.id, read: !m.read })}
                    style={{ background: "transparent", border: "1px solid #E3E3E3", borderRadius: 999, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}
                  >
                    {m.read ? "Segna come non letto" : "Segna come letto"}
                  </button>
                  <button
                    onClick={() => { if (confirm("Eliminare?")) del.mutate(m.id); }}
                    style={{ background: "transparent", border: "none", color: "#A5143B", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                  >
                    Elimina
                  </button>
                </div>
              </header>
              <p style={{ margin: 0, whiteSpace: "pre-wrap", color: "#3C3C3B", lineHeight: 1.5 }}>{m.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}