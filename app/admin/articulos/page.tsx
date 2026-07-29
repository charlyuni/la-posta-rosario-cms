import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { EstadoArticulo } from "@/lib/types";

const ESTADO_STYLE: Record<EstadoArticulo, string> = {
  borrador: "bg-tinta/10 text-tinta",
  revision: "bg-acento/15 text-acento",
  publicado: "bg-acento2/15 text-acento2",
};

export default async function ArticulosPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("id, titulo, estado, generado_por_ia, autor, actualizado_en")
    .order("actualizado_en", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Notas</h2>
        <Link
          href="/admin/articulos/nuevo"
          className="focus-ring rounded bg-tinta px-4 py-2 text-sm font-medium text-papel no-underline"
        >
          + Nueva nota
        </Link>
      </div>

      <ul className="flex flex-col gap-2">
        {(articles ?? []).map((a) => (
          <li key={a.id} className="flex items-center justify-between rounded border border-tinta/15 bg-white p-3">
            <div className="flex items-center gap-3">
              <span
                className={`rounded px-2 py-0.5 font-mono text-xs uppercase tracking-wide ${ESTADO_STYLE[a.estado as EstadoArticulo]}`}
              >
                {a.estado}
              </span>
              <Link href={`/admin/articulos/${a.id}`} className="focus-ring font-medium no-underline hover:underline">
                {a.titulo}
              </Link>
              {a.generado_por_ia && <span className="font-mono text-xs text-tinta/50">· generada por IA</span>}
            </div>
            <span className="font-mono text-xs text-tinta/50">{a.autor}</span>
          </li>
        ))}
        {(!articles || articles.length === 0) && (
          <p className="text-sm text-tinta/60">Todavía no hay notas cargadas.</p>
        )}
      </ul>
    </div>
  );
}
