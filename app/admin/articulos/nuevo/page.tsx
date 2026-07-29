import { createClient } from "@/lib/supabase/server";
import ArticleForm from "../article-form";
import { createArticle } from "../actions";

export default async function NuevoArticuloPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("orden");

  return (
    <div>
      <h2 className="mb-6 font-serif text-2xl font-bold">Nueva nota</h2>
      <ArticleForm action={createArticle} categories={categories ?? []} submitLabel="Crear nota" />
    </div>
  );
}
