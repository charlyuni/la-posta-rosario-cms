import { createClient } from "@/lib/supabase/server";
import ArticleForm from "../article-form";
import { createArticle } from "../actions";

export default async function NuevoArticuloPage() {
  const supabase = await createClient();
  const { data: categories, error } = await supabase.from("categories").select("*").order("orden");

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-widest text-accent2">Notas</p>
      <h1 className="mb-6 mt-0.5 font-serif text-2xl font-bold text-ink">Nueva nota</h1>
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          No se pudieron cargar las categorías: {error.code} - {error.message}
        </p>
      )}
      <ArticleForm action={createArticle} categories={categories ?? []} submitLabel="Crear nota" />
    </div>
  );
}
