// Supabase Edge Function — publicación automática en X/Instagram.
//
// Se dispara con un Database Webhook (Database → Webhooks) configurado sobre
// `articles`, evento UPDATE, condición: `estado` pasó a 'publicado'. Supabase
// envía el payload estándar { type, table, record, old_record }.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { postTweet } from "../_shared/twitter.ts";
import { postToInstagram } from "../_shared/instagram.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function truncar(texto: string, max: number): string {
  return texto.length <= max ? texto : `${texto.slice(0, max - 1)}…`;
}

Deno.serve(async (req) => {
  const payload = await req.json();
  const record = payload.record;
  const oldRecord = payload.old_record;

  const pasoAPublicado = record?.estado === "publicado" && oldRecord?.estado !== "publicado";
  if (!pasoAPublicado) {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 });
  }

  const { data: config } = await supabase.from("site_config").select("*").eq("id", 1).single();
  if (!config?.auto_publicar_redes) {
    return new Response(JSON.stringify({ skipped: "auto_publicar_redes está apagado" }), { status: 200 });
  }

  const { data: categoria } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", record.categoria_id)
    .maybeSingle();

  const dominio = config.dominio ?? "laposta-rosario.com.ar";
  const url = `https://${dominio}/${categoria?.slug ?? "nota"}/${record.slug}`;
  const resultados: Record<string, unknown>[] = [];

  const twitterCreds = {
    apiKey: Deno.env.get("TWITTER_API_KEY") ?? "",
    apiSecret: Deno.env.get("TWITTER_API_SECRET") ?? "",
    accessToken: Deno.env.get("TWITTER_ACCESS_TOKEN") ?? "",
    accessSecret: Deno.env.get("TWITTER_ACCESS_SECRET") ?? "",
  };

  if (twitterCreds.apiKey) {
    try {
      const texto = truncar(`${record.titulo}\n\n${url}`, 280);
      const { id } = await postTweet(texto, twitterCreds);
      await supabase.from("social_posts_log").insert({
        article_id: record.id,
        plataforma: "twitter",
        estado: "publicado",
        post_id_externo: id,
      });
      resultados.push({ plataforma: "twitter", ok: true, id });
    } catch (err) {
      await supabase.from("social_posts_log").insert({
        article_id: record.id,
        plataforma: "twitter",
        estado: "error",
        error: (err as Error).message,
      });
      resultados.push({ plataforma: "twitter", error: (err as Error).message });
    }
  }

  const igAccountId = Deno.env.get("INSTAGRAM_BUSINESS_ACCOUNT_ID") ?? "";
  const igToken = Deno.env.get("INSTAGRAM_ACCESS_TOKEN") ?? "";

  if (igAccountId && igToken && record.imagen_portada) {
    try {
      const caption = truncar(`${record.titulo}\n\n${record.bajada ?? ""}\n\n#Rosario #LaPostaRosario`, 2200);
      const { id } = await postToInstagram(
        record.imagen_portada,
        caption,
        `Nota completa: ${url}`,
        { businessAccountId: igAccountId, accessToken: igToken }
      );
      await supabase.from("social_posts_log").insert({
        article_id: record.id,
        plataforma: "instagram",
        estado: "publicado",
        post_id_externo: id,
      });
      resultados.push({ plataforma: "instagram", ok: true, id });
    } catch (err) {
      await supabase.from("social_posts_log").insert({
        article_id: record.id,
        plataforma: "instagram",
        estado: "error",
        error: (err as Error).message,
      });
      resultados.push({ plataforma: "instagram", error: (err as Error).message });
    }
  }

  return new Response(JSON.stringify({ resultados }), { headers: { "content-type": "application/json" } });
});
