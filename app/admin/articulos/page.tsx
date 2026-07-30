import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { EstadoArticulo } from "@/lib/types";

const ESTADO_STYLE: Record<EstadoArticulo, string> = {
  borrador: "bg-ink/10 text-muted",
  revision: "bg-accent/15 text-accent",
  publicado: "bg-accent2/15 text-accent2",
};

export default async function ArticulosPage() {
  const supabase = await createClient();
  const { data: articles, error } = await supabase
    .from("articles")
    .select("id, titulo, estado, generado_por_ia, autor, actualizado_en")
    .order("actualizado_en", { ascending: false });

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent2">Notas</p>
          <h1 className="mt-0.5 font-serif text-2xl font-bold text-ink">Todo lo que se escribió</h1>
        </div>
        <Link
          href="/admin/articulos/nuevo"
          className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg no-underline transition-opacity hover:opacity-90"
        >
          + Nueva nota
        </Link>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          No se pudieron cargar las notas: {error.code} - {error.message}
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {(articles ?? []).map((a) => (
          <li key={a.id} className="card flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide ${ESTADO_STYLE[a.estado as EstadoArticulo]}`}
              >
                {a.estado}
              </span>
              <Link
                href={`/admin/articulos/${a.id}`}
                className="focus-ring font-medium text-ink no-underline hover:text-accent2"
              >
                {a.titulo}
              </Link>
              {a.generado_por_ia && <span className="font-mono text-xs text-muted">· generada por IA</span>}
            </div>
            <span className="font-mono text-xs text-muted">{a.autor}</span>
          </li>
        ))}
        {(!articles || articles.length === 0) && !error && (
          <p className="text-sm text-muted">Todavía no hay notas cargadas.</p>
        )}
      </ul>
    </div>
  );
}
