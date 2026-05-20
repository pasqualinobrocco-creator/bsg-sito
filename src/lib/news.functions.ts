import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getPublishedNewsBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/i) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("news")
      .select("id,slug,title,excerpt,content,cover_url,category,author,published_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { news: row };
  });

export const listPublishedNews = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data, error } = await supabaseAdmin
      .from("news")
      .select("id,slug,title,excerpt,cover_url,category,author,published_at")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { news: data ?? [] };
  });