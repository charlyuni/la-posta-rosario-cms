"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createSource(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("sources").insert({
    nombre: String(formData.get("nombre") ?? ""),
    tipo: String(formData.get("tipo") ?? "rss"),
    url: String(formData.get("url") ?? ""),
    confiabilidad: Number(formData.get("confiabilidad") ?? 3),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/fuentes");
}

export async function toggleSource(id: string, activo: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("sources").update({ activo }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/fuentes");
}
