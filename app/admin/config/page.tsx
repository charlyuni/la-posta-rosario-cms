import { createClient } from "@/lib/supabase/server";
import ConfigForm from "./config-form";

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data: config, error } = await supabase.from("site_config").select("*").eq("id", 1).single();

  if (error || !config) {
    return (
      <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
        No se pudo cargar la configuración del sitio{error ? `: ${error.code} - ${error.message}` : "."}
      </p>
    );
  }

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent2">Configuración</p>
      <h1 className="mt-0.5 font-serif text-2xl font-bold text-ink">El portal, a tu gusto</h1>
      <p className="mb-8 mt-1 max-w-prose text-sm text-muted">
        Nombre, paleta, logo, contacto y redes — todo lo que ve el público sale de acá, sin tocar código.
      </p>
      <ConfigForm config={config} />
    </div>
  );
}
