import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { adminList, adminUpsert, adminDelete } from "@/lib/admin.functions";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "url" | "date";
  required?: boolean;
  listColumn?: boolean;
};

export type EntityConfig = {
  table: "news" | "case_histories" | "services" | "clients";
  title: string;
  fields: FieldDef[];
  newRow: Record<string, unknown>;
};

export function EntityManager({ config }: { config: EntityConfig }) {
  const qc = useQueryClient();
  const listFn = useServerFn(adminList);
  const upsertFn = useServerFn(adminUpsert);
  const deleteFn = useServerFn(adminDelete);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", config.table],
    queryFn: () => listFn({ data: { table: config.table } }),
  });

  const save = useMutation({
    mutationFn: (row: Record<string, any>) =>
      upsertFn({ data: { table: config.table, row } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", config.table] });
      setEditing(null);
    },
    onError: (e: any) => alert(e?.message ?? "Errore"),
  });

  const del = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { table: config.table, id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", config.table] }),
    onError: (e: any) => alert(e?.message ?? "Errore"),
  });

  const cols = config.fields.filter((f) => f.listColumn !== false).slice(0, 4);

  return (
    <div>
      <header style={st.header}>
        <h1 style={st.h1}>{config.title}</h1>
        <button style={st.primary} onClick={() => setEditing({ ...config.newRow })}>
          + Nuovo
        </button>
      </header>

      {isLoading ? (
        <p>Caricamento…</p>
      ) : (
        <div style={st.tableWrap}>
          <table style={st.table}>
            <thead>
              <tr>
                {cols.map((f) => (
                  <th key={f.key} style={st.th}>{f.label}</th>
                ))}
                <th style={st.th}>Pubblicato</th>
                <th style={st.th}></th>
              </tr>
            </thead>
            <tbody>
              {(data?.rows ?? []).map((row: any) => (
                <tr key={row.id} style={st.tr}>
                  {cols.map((f) => (
                    <td key={f.key} style={st.td}>
                      {String(row[f.key] ?? "—").slice(0, 80)}
                    </td>
                  ))}
                  <td style={st.td}>{row.published ? "✓" : "—"}</td>
                  <td style={{ ...st.td, textAlign: "right", whiteSpace: "nowrap" }}>
                    <button style={st.smallBtn} onClick={() => setEditing(row)}>Modifica</button>
                    <button
                      style={{ ...st.smallBtn, color: "#A5143B" }}
                      onClick={() => {
                        if (confirm("Eliminare definitivamente?")) del.mutate(row.id);
                      }}
                    >
                      Elimina
                    </button>
                  </td>
                </tr>
              ))}
              {(data?.rows ?? []).length === 0 && (
                <tr>
                  <td colSpan={cols.length + 2} style={{ ...st.td, color: "#878787", textAlign: "center", padding: 40 }}>
                    Nessun elemento. Clicca "+ Nuovo" per crearne uno.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <EditModal
          config={config}
          row={editing}
          onClose={() => setEditing(null)}
          onSave={(r) => save.mutate(r)}
          saving={save.isPending}
        />
      )}
    </div>
  );
}

function EditModal({
  config,
  row,
  onClose,
  onSave,
  saving,
}: {
  config: EntityConfig;
  row: Record<string, any>;
  onClose: () => void;
  onSave: (r: Record<string, any>) => void;
  saving: boolean;
}) {
  const [draft, setDraft] = useState<Record<string, any>>(row);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
  };

  return (
    <div style={st.backdrop} onClick={onClose}>
      <form style={st.modal} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2 style={{ margin: "0 0 16px", fontSize: 20 }}>
          {row.id ? "Modifica" : "Nuovo"} — {config.title}
        </h2>
        <div style={{ display: "grid", gap: 14, maxHeight: "60vh", overflow: "auto", paddingRight: 4 }}>
          {config.fields.map((f) => (
            <label key={f.key} style={st.field}>
              <span style={st.fieldLabel}>{f.label}{f.required ? " *" : ""}</span>
              {f.type === "textarea" ? (
                <textarea
                  rows={4}
                  required={f.required}
                  value={draft[f.key] ?? ""}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
                  style={st.input}
                />
              ) : f.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={!!draft[f.key]}
                  onChange={(e) => setDraft({ ...draft, [f.key]: e.target.checked })}
                  style={{ justifySelf: "start", width: 20, height: 20 }}
                />
              ) : (
                <input
                  type={f.type === "number" ? "number" : f.type === "url" ? "url" : f.type === "date" ? "datetime-local" : "text"}
                  required={f.required}
                  value={
                    f.type === "date" && draft[f.key]
                      ? String(draft[f.key]).slice(0, 16)
                      : (draft[f.key] ?? "")
                  }
                  onChange={(e) => {
                    const v = f.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value;
                    setDraft({ ...draft, [f.key]: v });
                  }}
                  style={st.input}
                />
              )}
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} style={st.ghost}>Annulla</button>
          <button type="submit" disabled={saving} style={st.primary}>
            {saving ? "Salvataggio…" : "Salva"}
          </button>
        </div>
      </form>
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  h1: { margin: 0, fontSize: 28, fontWeight: 800, color: "#1A1A1A" },
  primary: {
    padding: "10px 18px",
    background: "#639730",
    color: "#0A0D08",
    border: "none",
    borderRadius: 999,
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 14,
  },
  ghost: {
    padding: "10px 18px",
    background: "transparent",
    color: "#3C3C3B",
    border: "1px solid #E3E3E3",
    borderRadius: 999,
    cursor: "pointer",
    fontSize: 14,
  },
  smallBtn: {
    background: "transparent",
    border: "none",
    color: "#3C3C3B",
    cursor: "pointer",
    fontSize: 13,
    padding: "4px 8px",
    fontWeight: 600,
  },
  tableWrap: { background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #E3E3E3" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    background: "#F6F6F6",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#706F6F",
    fontWeight: 700,
    borderBottom: "1px solid #E3E3E3",
  },
  tr: { borderBottom: "1px solid #EDEDED" },
  td: { padding: "14px 16px", fontSize: 14, color: "#3C3C3B", verticalAlign: "top" },
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "grid",
    placeItems: "center",
    padding: 24,
    zIndex: 100,
  },
  modal: {
    background: "#fff",
    borderRadius: 16,
    padding: 28,
    width: "100%",
    maxWidth: 600,
    maxHeight: "90vh",
    overflow: "auto",
  },
  field: { display: "grid", gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: 700, color: "#3C3C3B", textTransform: "uppercase", letterSpacing: "0.05em" },
  input: {
    padding: "10px 12px",
    border: "1px solid #E3E3E3",
    borderRadius: 8,
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
};