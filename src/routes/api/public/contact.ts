import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(200).optional().nullable(),
  phone: z.string().trim().max(50).optional().nullable(),
  message: z.string().trim().min(1).max(5000),
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const data = Schema.parse(body);
          const { error } = await supabaseAdmin.from("contact_messages").insert({
            name: data.name,
            email: data.email,
            company: data.company ?? null,
            phone: data.phone ?? null,
            message: data.message,
          });
          if (error) {
            console.error("[contact] insert error:", error);
            return Response.json({ ok: false, error: "save_failed" }, { status: 500, headers: cors });
          }
          return Response.json({ ok: true }, { headers: cors });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "invalid_request";
          return Response.json({ ok: false, error: msg }, { status: 400, headers: cors });
        }
      },
    },
  },
});