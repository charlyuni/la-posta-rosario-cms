"use client";

import { useFormStatus } from "react-dom";
import type { Article, Category } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded-lg bg-accent px-5 py-2.5 font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : label}
    </button>
  );
}

export default function ArticleForm({
  action,
  article,
  categories,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  article?: Article;
  categories: Category[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex max-w-3xl flex-col gap-6">
      <div className="card flex flex-col gap-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Título</span>
          <input
            name="titulo"
            defaultValue={article?.titulo}
            required
            maxLength={110}
            className="field font-serif text-lg"
          />
          <span className="font-mono text-xs text-muted">70–95 caracteres rinde mejor en Google Discover.</span>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Bajada</span>
          <textarea name="bajada" defaultValue={article?.bajada ?? ""} rows={2} className="field" />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Cuerpo (HTML)</span>
          <textarea
            name="cuerpo_html"
            defaultValue={article?.cuerpo_html ?? ""}
            required
            rows={14}
            className="field font-mono text-sm"
          />
        </label>
      </div>

      <div className="card grid grid-cols-2 gap-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Imagen de portada (URL)</span>
          <input name="imagen_portada" defaultValue={article?.imagen_portada ?? ""} className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Texto alternativo de la imagen</span>
          <input name="alt_imagen" defaultValue={article?.alt_imagen ?? ""} className="field" />
        </label>
      </div>

      <div className="card grid grid-cols-3 gap-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Categoría</span>
          <select name="categoria_id" defaultValue={article?.categoria_id ?? ""} className="field">
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Barrio</span>
          <input name="barrio" defaultValue={article?.barrio ?? ""} placeholder="Pichincha, Abasto…" className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Autor</span>
          <input name="autor" defaultValue={article?.autor ?? "Redacción"} className="field" />
        </label>
      </div>

      <div className="card grid grid-cols-2 gap-4 p-5">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Meta título (SEO)</span>
          <input name="meta_title" defaultValue={article?.meta_title ?? ""} maxLength={95} className="field" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Meta descripción (SEO)</span>
          <input
            name="meta_description"
            defaultValue={article?.meta_description ?? ""}
            maxLength={160}
            className="field"
          />
        </label>
      </div>

      {article?.fuente_nombre && (
        <p className="rounded-lg border border-accent2/30 bg-accent2/5 p-3 font-mono text-xs text-ink">
          Generado a partir de: {article.fuente_nombre}
          {article.fuente_original_url && (
            <>
              {" — "}
              <a href={article.fuente_original_url} target="_blank" rel="noreferrer">
                ver original
              </a>
            </>
          )}
        </p>
      )}

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">Estado</span>
        <select name="estado" defaultValue={article?.estado ?? "borrador"} className="field w-48">
          <option value="borrador">Borrador</option>
          <option value="revision">En revisión</option>
          <option value="publicado">Publicado</option>
        </select>
      </label>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
