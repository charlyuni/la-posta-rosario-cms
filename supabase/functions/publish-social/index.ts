// Supabase Edge Function — publicación automática en X/Instagram.
//
// Se dispara con un Database Webhook (Database → Webhooks) configurado sobre
// `articles`, evento UPDATE, condición: `estado` pasó a 'publicado'. Supabase
// envía el payload estándar { type, table, record, old_record }.
//
// Archivo autocontenido (sin imports relativos a _shared) para poder pegarlo
// directo en el editor de Edge Functions del dashboard de Supabase.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function truncar(texto: string, max: number): string {
  return texto.length <= max ? texto : `${texto.slice(0, max - 1)}…`;
}

// ---------------------------------------------------------------------------
// Twitter / X — API v2, firmado OAuth 1.0a (user context; el plan Free alcanza)
// ---------------------------------------------------------------------------
interface TwitterCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
}

function percentEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function hmacSha1Base64(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey("raw", encoder.encode(key), { name: "HMAC", hash: "SHA-1" }, false, [
    "sign",
  ]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function buildOAuthHeader(method: string, url: string, creds: TwitterCredentials): Promise<string> {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };

  const paramString = Object.entries(oauthParams)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${percentEncode(k)}=${percentEncode(v)}`)
    .join("&");

  const baseString = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramString)}`;
  const signingKey = `${percentEncode(creds.apiSecret)}&${percentEncode(creds.accessSecret)}`;
  const signature = await hmacSha1Base64(signingKey, baseString);

  const headerParams = { ...oauthParams, oauth_signature: signature };
  return (
    "OAuth " +
    Object.entries(headerParams)
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([k, v]) => `${percentEncode(k)}="${percentEncode(v)}"`)
      .join(", ")
  );
}

async function postTweet(text: string, creds: TwitterCredentials): Promise<{ id: string }> {
  const url = "https://api.twitter.com/2/tweets";
  const authHeader = await buildOAuthHeader("POST", url, creds);

  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error(`Twitter API ${res.status}: ${await res.text()}`);

  const json = await res.json();
  return { id: json.data.id };
}

// ---------------------------------------------------------------------------
// Instagram — Graph API. No permite links clicables en el caption, así que
// el link a la nota se agrega como primer comentario.
// ---------------------------------------------------------------------------
interface InstagramCredentials {
  businessAccountId: string;
  accessToken: string;
}

const GRAPH_BASE = "https://graph.facebook.com/v21.0";

async function postToInstagram(
  imageUrl: string,
  caption: string,
  linkComment: string,
  creds: InstagramCredentials
): Promise<{ id: string }> {
  const containerRes = await fetch(`${GRAPH_BASE}/${creds.businessAccountId}/media?access_token=${creds.accessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_url: imageUrl, caption }),
  });
  if (!containerRes.ok) {
    throw new Error(`Instagram (crear contenedor) ${containerRes.status}: ${await containerRes.text()}`);
  }
  const { id: creationId } = await containerRes.json();

  const publishRes = await fetch(
    `${GRAPH_BASE}/${creds.businessAccountId}/media_publish?access_token=${creds.accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creationId }),
    }
  );
  if (!publishRes.ok) {
    throw new Error(`Instagram (publicar) ${publishRes.status}: ${await publishRes.text()}`);
  }
  const { id: mediaId } = await publishRes.json();

  await fetch(`${GRAPH_BASE}/${mediaId}/comments?access_token=${creds.accessToken}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: linkComment }),
  });

  return { id: mediaId };
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
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

  const { data: categoria } = await supabase.from("categories").select("slug").eq("id", record.categoria_id).maybeSingle();

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
      const { id } = await postToInstagram(record.imagen_portada, caption, `Nota completa: ${url}`, {
        businessAccountId: igAccountId,
        accessToken: igToken,
      });
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
