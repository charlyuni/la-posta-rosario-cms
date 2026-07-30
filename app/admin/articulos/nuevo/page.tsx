import { createClient } from "@/lib/supabase/server";
import ArticleForm from "../article-form";
import { createArticle } from "../actions";

export default async function NuevoArticuloPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase.from("categories").select("*").order("orden");

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-bold">Nueva nota</h2>
      {error && (
        <p role="alert" className="mb-4 rounded border border-urgente/30 bg-urgente/10 p-3 text-sm text-urgente">
          No se pudieron cargar las categorías: {error.code} - {error.message}
        </p>
      )}
      <ArticleForm action={createArticle} categories={categories ?? []} submitLabel="Crear nota" />
    </div>
  );
}
