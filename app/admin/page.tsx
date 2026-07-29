import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [{ count: publicados }, { count: enRevision }, { count: borradores }] = await Promise.all([
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("estado", "publicado"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("estado", "revision"),
    supabase.from("articles").select("*", { count: "exact", head: true }).eq("estado", "borrador"),
  ]);

  const { data: pendientes } = await supabase
    .from("articles")
    .select("id, titulo, generado_por_ia, creado_en")
    .eq("estado", "revision")
    .order("creado_en", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Publicadas", value: publicados ?? 0 },
    { label: "En revisión", value: enRevision ?? 0 },
    { label: "Borradores", value: borradores ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded border border-tinta/15 bg-white p-4">
            <p className="font-mono text-xs uppercase tracking-wide text-tinta/60">{s.label}</p>
            <p className="font-serif text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-3 font-serif text-xl font-bold">Cola editorial (pendientes de revisión)</h2>
        {pendientes && pendientes.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {pendientes.map((a) => (
              <li key={a.id} className="flex items-center justify-between rounded border border-tinta/15 bg-white p-3">
                <span>
                  {a.titulo}
                  {a.generado_por_ia && (
                    <span className="ml-2 rounded bg-acento2/10 px-2 py-0.5 font-mono text-xs text-acento2">IA</span>
                  )}
                </span>
                <Link href={`/admin/articulos/${a.id}`} className="focus-ring text-sm">
                  Revisar
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-tinta/60">No hay notas esperando revisión.</p>
        )}
      </section>
    </div>
  );
}
