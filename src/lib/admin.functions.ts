import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ---------- helpers ----------
async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

// ---------- claim first admin ----------
// Allows the first registered user to claim admin role (only if no admins exist).
export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { count, error: cErr } = await supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) {
      throw new Error("Un amministratore esiste già. Chiedi a chi è admin di assegnarti il ruolo.");
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (data ?? []).map((r: any) => r.role as string);
    return { userId, isAdmin: roles.includes("admin"), roles };
  });

// ---------- generic list ----------
const TABLES = ["news", "case_histories", "services", "clients", "contact_messages"] as const;
type TableName = (typeof TABLES)[number];
const TableSchema = z.enum(TABLES);

export const adminList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { table: TableName }) =>
    z.object({ table: TableSchema }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const orderCol =
      data.table === "contact_messages"
        ? "created_at"
        : data.table === "news"
          ? "created_at"
          : "sort_order";
    const { data: rows, error } = await supabase
      .from(data.table)
      .select("*")
      .order(orderCol, { ascending: data.table === "news" ? false : true });
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });

export const adminUpsert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { table: TableName; row: Record<string, unknown> }) =>
    z
      .object({
        table: TableSchema,
        row: z.record(z.string(), z.any()),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (data.table === "contact_messages") {
      throw new Error("contact_messages is read-only via admin upsert");
    }
    const row = { ...data.row } as any;
    // strip empty strings to null for nullable fields
    Object.keys(row).forEach((k) => {
      if (row[k] === "") row[k] = null;
    });
    const { data: saved, error } = row.id
      ? await supabase.from(data.table).update(row).eq("id", row.id).select().single()
      : await supabase.from(data.table).insert(row).select().single();
    if (error) throw new Error(error.message);
    return { row: saved };
  });

export const adminDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { table: TableName; id: string }) =>
    z.object({ table: TableSchema, id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminMarkMessageRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string; read: boolean }) =>
    z.object({ id: z.string().uuid(), read: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase
      .from("contact_messages")
      .update({ read: data.read })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });