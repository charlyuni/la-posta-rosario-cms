import { createClient } from "@/lib/supabase/server";
import { createSource, toggleSource } from "./actions";

export default async function FuentesPage() {
  const supabase = await createClient();
  const { data: sources, error } = await supabase.from("sources").select("*").order("creado_en", { ascending: false });

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent2">Automatización</p>
      <h1 className="mt-0.5 font-serif text-2xl font-bold text-ink">Fuentes de noticias</h1>
      <p className="mb-6 mt-1 max-w-prose text-sm text-muted">
        El pipeline de ingesta automática (ver <code className="font-mono text-ink">supabase/functions/ingest-news</code>) lee
        estas fuentes cada 15–30 min. Antes de activar una, revisá su <code className="font-mono text-ink">robots.txt</code>{" "}
        y términos de uso.
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          No se pudieron cargar las fuentes: {error.code} - {error.message}
        </p>
      )}

      <form action={createSource} className="card mb-8 flex flex-wrap items-end gap-3 p-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Nombre</span>
          <input name="nombre" required className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Tipo</span>
          <select name="tipo" className="field">
            <option value="rss">RSS</option>
            <option value="oficial">Fuente oficial</option>
            <option value="api">API</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">URL del feed</span>
          <input name="url" type="url" required className="field w-72" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Confiabilidad (1-5)</span>
          <input name="confiabilidad" type="number" min={1} max={5} defaultValue={3} className="field w-20" />
        </label>
        <button
          type="submit"
          className="focus-ring rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
        >
          Agregar
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {(sources ?? []).map((s) => (
          <li key={s.id} className="card flex items-center justify-between p-3.5">
            <div>
              <p className="font-medium text-ink">
                {s.nombre} <span className="font-mono text-xs text-muted">· {s.tipo}</span>
              </p>
              <p className="font-mono text-xs text-muted">{s.url}</p>
            </div>
            <form action={toggleSource.bind(null, s.id, !s.activo)}>
              <button
                type="submit"
                className={`focus-ring rounded-full px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide ${
                  s.activo ? "bg-accent2/15 text-accent2" : "bg-ink/10 text-muted"
                }`}
              >
                {s.activo ? "Activa" : "Pausada"}
              </button>
            </form>
          </li>
        ))}
        {(!sources || sources.length === 0) && !error && (
          <p className="text-sm text-muted">Todavía no cargaste ninguna fuente.</p>
        )}
      </ul>
    </div>
  );
}
