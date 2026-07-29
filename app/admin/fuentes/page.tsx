import { createClient } from "@/lib/supabase/server";
import { createSource, toggleSource } from "./actions";

export default async function FuentesPage() {
  const supabase = await createClient();
  const { data: sources } = await supabase.from("sources").select("*").order("creado_en", { ascending: false });

  return (
    <div>
      <h2 className="mb-1 font-serif text-2xl font-bold">Fuentes de noticias</h2>
      <p className="mb-6 max-w-prose text-sm text-tinta/70">
        El pipeline de ingesta automática (ver <code className="font-mono">supabase/functions/ingest-news</code>) lee
        estas fuentes cada 15–30 min. Antes de activar una, revisá su <code className="font-mono">robots.txt</code> y
        términos de uso.
      </p>

      <form action={createSource} className="mb-8 flex flex-wrap items-end gap-3 rounded border border-tinta/15 bg-white p-4">
        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input name="nombre" required className="focus-ring rounded border border-tinta/20 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tipo
          <select name="tipo" className="focus-ring rounded border border-tinta/20 px-3 py-2">
            <option value="rss">RSS</option>
            <option value="oficial">Fuente oficial</option>
            <option value="api">API</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          URL del feed
          <input name="url" type="url" required className="focus-ring w-72 rounded border border-tinta/20 px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Confiabilidad (1-5)
          <input
            name="confiabilidad"
            type="number"
            min={1}
            max={5}
            defaultValue={3}
            className="focus-ring w-20 rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <button type="submit" className="focus-ring rounded bg-tinta px-4 py-2 text-sm font-medium text-papel">
          Agregar
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {(sources ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded border border-tinta/15 bg-white p-3">
            <div>
              <p className="font-medium">
                {s.nombre} <span className="font-mono text-xs text-tinta/50">· {s.tipo}</span>
              </p>
              <p className="font-mono text-xs text-tinta/50">{s.url}</p>
            </div>
            <form action={toggleSource.bind(null, s.id, !s.activo)}>
              <button type="submit" className={`focus-ring text-sm ${s.activo ? "text-acento2" : "text-tinta/40"}`}>
                {s.activo ? "Activa" : "Pausada"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
