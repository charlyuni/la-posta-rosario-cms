import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: publicados }, { count: enRevision }, { count: borradores }] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("estado", "publicado"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("estado", "revision"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("estado", "borrador"),
  ]);

  const { data: pendientes, error } = await supabase
    .from("articles")
    .select("id, titulo, generado_por_ia, creado_en")
    .eq("estado", "revision")
    .order("creado_en", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Publicadas", value: publicados ?? 0, accent: "text-accent2" },
    { label: "En revisión", value: enRevision ?? 0, accent: "text-accent" },
    { label: "Borradores", value: borradores ?? 0, accent: "text-ink" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent2">Panel</p>
        <h1 className="mt-0.5 font-serif text-2xl font-bold text-ink">Cómo está la redacción hoy</h1>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          No se pudo cargar la cola editorial: {error.code} - {error.message}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <p className="font-mono text-xs uppercase tracking-wide text-muted">{s.label}</p>
            <p className={`mt-1 font-serif text-4xl font-bold tabular-nums ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-serif text-xl font-bold text-ink">Cola editorial</h2>
        {pendientes && pendientes.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {pendientes.map((a) => (
              <li key={a.id} className="card flex items-center justify-between p-3.5">
                <span className="text-sm text-ink">
                  {a.titulo}
                  {a.generado_por_ia && (
                    <span className="ml-2 rounded-full bg-accent2/10 px-2 py-0.5 font-mono text-xs text-accent2">
                      IA
                    </span>
                  )}
                </span>
                <Link href={`/admin/articulos/${a.id}`} className="focus-ring text-sm font-medium">
                  Revisar →
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          !error && <p className="text-sm text-muted">No hay notas esperando revisión.</p>
        )}
      </section>
    </div>
  );
}
