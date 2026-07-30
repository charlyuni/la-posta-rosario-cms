// Supabase Edge Function — ingesta automática de noticias.
// Se programa con un cron (ver README) cada 15-30 minutos.
//
// Flujo: lee fuentes activas -> descarga el feed -> descarta lo ya visto ->
// reescribe cada nota con IA (transformativo, con atribución) -> inserta en
// `articles` como `revision` o `publicado` según `site_config.auto_publicar_ingesta`.
//
// Aviso de riesgo legal (ver README y el plan de producto): la reescritura
// debe ser sustancialmente transformativa, nunca un resumen o traducción del
// original, y siempre se guarda `fuente_original_url` / `fuente_nombre` para
// que el portal muestre la atribución.
//
// Archivo autocontenido (sin imports relativos a _shared) para poder pegarlo
// directo en el editor de Edge Functions del dashboard de Supabase.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ---------------------------------------------------------------------------
// Parser mínimo de RSS 2.0 / Atom, suficiente para feeds de medios argentinos.
// ---------------------------------------------------------------------------
interface RssItem {
  titulo: string;
  link: string;
  descripcion: string;
}

function extractTag(block: string, tag: string): string {
  const cdataMatch = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i").exec(block);
  if (cdataMatch) return cdataMatch[1].trim();

  const plainMatch = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i").exec(block);
  if (!plainMatch) return "";

  return plainMatch[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function parseFeed(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? xml.match(/<entry[\s\S]*?<\/entry>/gi) ?? [];

  for (const block of itemBlocks) {
    const titulo = extractTag(block, "title");
    let link = extractTag(block, "link");
    if (!link) {
      const hrefMatch = /<link[^>]*href=["']([^"']+)["']/i.exec(block);
      link = hrefMatch?.[1] ?? "";
    }
    const descripcion = extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content");

    if (titulo && link) items.push({ titulo, link, descripcion });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Reescritura con IA
// ---------------------------------------------------------------------------
interface NotaGenerada {
  titulo: string;
  bajada: string;
  cuerpo_html: string;
  meta_title: string;
  meta_description: string;
  categoria_slug: string;
  barrio: string | null;
}

function slugify(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function rewriteWithAI(item: { titulo: string; descripcion: string }, fuenteNombre: string): Promise<NotaGenerada> {
  const prompt = `Sos redactor/a de "La Posta Rosario", un portal de noticias hiperlocal de Rosario, Argentina.

Te paso el título y la bajada/descripción de una noticia publicada por otro medio (${fuenteNombre}). Tu trabajo es escribir
una NOTA COMPLETAMENTE PROPIA sobre el mismo hecho: estructura propia, redacción propia, ángulo propio. NO traduzcas ni
resumas el texto original — reconstruí la noticia como si la estuvieras contando de cero a partir del hecho que describe.

Título original: ${item.titulo}
Descripción original: ${item.descripcion}

Devolvé SOLO un JSON (sin markdown, sin texto alrededor) con esta forma exacta:
{
  "titulo": "título propio de 70 a 95 caracteres, con una entidad reconocible (barrio, institución, nombre)",
  "bajada": "una oración que resuma el hecho",
  "cuerpo_html": "el cuerpo de la nota en HTML simple (<p>), 3 a 5 párrafos, mencionando '${fuenteNombre}' como fuente de la información",
  "meta_title": "título para SEO, hasta 95 caracteres",
  "meta_description": "hasta 160 caracteres",
  "categoria_slug": "una de: ciudad, policiales, politica, deportes, economia, cultura",
  "barrio": "nombre de barrio de Rosario si el hecho lo menciona, o null"
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const text = json.content?.[0]?.text ?? "{}";
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
  return JSON.parse(cleaned);
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
Deno.serve(async () => {
  const { data: config } = await supabase.from("site_config").select("auto_publicar_ingesta").eq("id", 1).single();
  const { data: categories } = await supabase.from("categories").select("id, slug");
  const categoriaPorSlug = new Map((categories ?? []).map((c) => [c.slug, c.id]));

  const { data: sources } = await supabase.from("sources").select("*").eq("activo", true).eq("tipo", "rss");

  const resultados: Record<string, unknown>[] = [];

  for (const source of sources ?? []) {
    try {
      const feedRes = await fetch(source.url);
      const xml = await feedRes.text();
      const items = parseFeed(xml).slice(0, 10);

      for (const item of items) {
        const { data: existente } = await supabase
          .from("articles")
          .select("id")
          .eq("fuente_original_url", item.link)
          .maybeSingle();

        if (existente) continue;

        const nota = await rewriteWithAI(item, source.nombre);
        const categoriaId = categoriaPorSlug.get(nota.categoria_slug) ?? null;

        const { error } = await supabase.from("articles").insert({
          titulo: nota.titulo,
          slug: slugify(nota.titulo),
          bajada: nota.bajada,
          cuerpo_html: nota.cuerpo_html,
          categoria_id: categoriaId,
          barrio: nota.barrio,
          autor: "Redacción (IA)",
          estado: config?.auto_publicar_ingesta ? "publicado" : "revision",
          publicado_en: config?.auto_publicar_ingesta ? new Date().toISOString() : null,
          fuente_original_url: item.link,
          fuente_nombre: source.nombre,
          generado_por_ia: true,
          meta_title: nota.meta_title,
          meta_description: nota.meta_description,
        });

        if (error) {
          resultados.push({ fuente: source.nombre, item: item.titulo, error: error.message });
        } else {
          resultados.push({ fuente: source.nombre, item: item.titulo, ok: true });
        }
      }

      await supabase.from("sources").update({ ultima_revision: new Date().toISOString() }).eq("id", source.id);
    } catch (err) {
      resultados.push({ fuente: source.nombre, error: (err as Error).message });
    }
  }

  return new Response(JSON.stringify({ resultados }), { headers: { "content-type": "application/json" } });
});
