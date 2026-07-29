import { createClient } from "@/lib/supabase/server";
import ConfigForm from "./config-form";

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("site_config").select("*").eq("id", 1).single();

  if (!config) {
    return <p className="text-urgente">No se pudo cargar la configuración del sitio.</p>;
  }

  return (
    <div>
      <h2 className="mb-1 font-serif text-2xl font-bold">Configuración del portal</h2>
      <p className="mb-6 max-w-prose text-sm text-tinta/70">
        Nombre, paleta, logo, contacto y redes — todo lo que ve el público sale de acá, sin tocar código.
      </p>
      <ConfigForm config={config} />
    </div>
  );
}
