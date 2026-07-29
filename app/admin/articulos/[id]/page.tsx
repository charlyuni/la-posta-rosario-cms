import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ArticleForm from "../article-form";
import { updateArticle, deleteArticle } from "../actions";

export default async function EditarArticuloPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: article }, { data: categories }] = await Promise.all([
    supabase.from("articles").select("*").eq("id", id).single(),
    supabase.from("categories").select("*").order("orden"),
  ]);

  if (!article) notFound();

  const boundUpdate = updateArticle.bind(null, id);
  const boundDelete = deleteArticle.bind(null, id);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">Editar nota</h2>
        <form action={boundDelete}>
          <button type="submit" className="focus-ring text-sm text-urgente">
            Eliminar
          </button>
        </form>
      </div>
      <ArticleForm action={boundUpdate} article={article} categories={categories ?? []} submitLabel="Guardar cambios" />
    </div>
  );
}
