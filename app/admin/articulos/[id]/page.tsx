import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "../article-form";
import { updateArticle, deleteArticle } from "../actions";

export default async function EditarArticuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: article }, { data: categories, error }] = await Promise.all([
    supabase.from("articles").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("orden"),
  ]);

  if (!article) notFound();

  const boundUpdate = updateArticle.bind(null, id);
  const boundDelete = deleteArticle.bind(null, id);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent2">Notas</p>
          <h1 className="mt-0.5 font-serif text-2xl font-bold text-ink">Editar nota</h1>
        </div>
        <form action={boundDelete}>
          <button type="submit" className="focus-ring text-sm text-danger hover:underline">
            Eliminar
          </button>
        </form>
      </div>
      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          No se pudieron cargar las categorías: {error.code} - {error.message}
        </p>
      )}
      <ArticleForm action={boundUpdate} article={article} categories={categories ?? []} submitLabel="Guardar cambios" />
    </div>
  );
}
