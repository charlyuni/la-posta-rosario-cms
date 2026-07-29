"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Article } from "@/lib/types";

function slugify(titulo: string): string {
  return titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readArticleForm(formData: FormData): Partial<Article> {
  const estado = String(formData.get("estado") ?? "borrador") as Article["estado"];
  return {
    titulo: String(formData.get("titulo") ?? ""),
    bajada: String(formData.get("bajada") ?? "") || null,
    cuerpo_html: String(formData.get("cuerpo_html") ?? ""),
    imagen_portada: String(formData.get("imagen_portada") ?? "") || null,
    alt_imagen: String(formData.get("alt_imagen") ?? "") || null,
    categoria_id: String(formData.get("categoria_id") ?? "") || null,
    barrio: String(formData.get("barrio") ?? "") || null,
    autor: String(formData.get("autor") ?? "Redacción"),
    estado,
    meta_title: String(formData.get("meta_title") ?? "") || null,
    meta_description: String(formData.get("meta_description") ?? "") || null,
    publicado_en: estado === "publicado" ? new Date().toISOString() : null,
  };
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();
  const data = readArticleForm(formData);

  if (!data.titulo) throw new Error("El título es obligatorio.");
  if (data.estado !== "borrador" && (!data.alt_imagen || !data.imagen_portada)) {
    throw new Error("Para publicar o enviar a revisión, la nota necesita imagen de portada y su texto alternativo (accesibilidad).");
  }

  const slug = slugify(data.titulo);

  const { data: created, error } = await supabase
    .from("articles")
    .insert({ ...data, slug })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/admin/articulos");
  redirect(`/admin/articulos/${created.id}`);
}

export async function updateArticle(id: string, formData: FormData) {
  const supabase = await createClient();
  const data = readArticleForm(formData);

  if (data.estado !== "borrador" && (!data.alt_imagen || !data.imagen_portada)) {
    throw new Error("Para publicar o enviar a revisión, la nota necesita imagen de portada y su texto alternativo (accesibilidad).");
  }

  const { error } = await supabase.from("articles").update(data).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/articulos");
  revalidatePath(`/admin/articulos/${id}`);
}

export async function deleteArticle(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("articles").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/articulos");
  redirect("/admin/articulos");
}
