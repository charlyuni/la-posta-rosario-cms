"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SiteConfig } from "@/lib/types";
import { contrastRatio, WCAG_AA_MINIMO } from "@/lib/contrast";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveConfig(_prevState: { ok?: boolean; error?: string } | undefined, formData: FormData) {
  const supabase = await createClient();

  const redes_json = {
    twitter: String(formData.get("twitter") ?? ""),
    instagram: String(formData.get("instagram") ?? ""),
    facebook: String(formData.get("facebook") ?? ""),
  };

  const update: Partial<SiteConfig> = {
    nombre_portal: String(formData.get("nombre_portal") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    logo_url: String(formData.get("logo_url") ?? "") || null,
    color_tinta: String(formData.get("color_tinta") ?? ""),
    color_papel: String(formData.get("color_papel") ?? ""),
    color_acento: String(formData.get("color_acento") ?? ""),
    color_acento2: String(formData.get("color_acento2") ?? ""),
    color_urgente: String(formData.get("color_urgente") ?? ""),
    email_contacto: String(formData.get("email_contacto") ?? "") || null,
    telefono_whatsapp: String(formData.get("telefono_whatsapp") ?? "") || null,
    direccion: String(formData.get("direccion") ?? "") || null,
    dominio: String(formData.get("dominio") ?? "") || null,
    analytics_id: String(formData.get("analytics_id") ?? "") || null,
    auto_publicar_ingesta: formData.get("auto_publicar_ingesta") === "on",
    auto_publicar_redes: formData.get("auto_publicar_redes") === "on",
    redes_json,
  };

  const ratio = contrastRatio(update.color_tinta!, update.color_papel!);
  if (ratio < WCAG_AA_MINIMO) {
    return {
      error: `Contraste insuficiente entre tinta y papel (${ratio.toFixed(2)}:1, mínimo WCAG AA es ${WCAG_AA_MINIMO}:1). Elegí colores más separados.`,
    };
  }

  const { error } = await supabase.from("site_config").update(update).eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/admin/config");
  return { ok: true };
}
