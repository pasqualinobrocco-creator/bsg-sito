import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60",
};

export const Route = createFileRoute("/api/public/news")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const { data, error } = await supabaseAdmin
          .from("news")
          .select("id,slug,title,excerpt,cover_url,category,author,published_at")
          .eq("published", true)
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false });
        if (error) {
          console.error("[api/public/news] error:", error);
          return Response.json({ news: [], error: "load_failed" }, { status: 500, headers: cors });
        }
        return Response.json({ news: data ?? [] }, { headers: cors });
      },
    },
  },
});