"use client";

import { useFormStatus } from "react-dom";
import type { Article, Category } from "@/lib/types";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded bg-tinta px-4 py-2 font-medium text-papel disabled:opacity-60"
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
    <form action={action} className="flex max-w-3xl flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        Título
        <input
          name="titulo"
          defaultValue={article?.titulo}
          required
          maxLength={110}
          className="focus-ring rounded border border-tinta/20 px-3 py-2 font-serif text-lg"
        />
        <span className="font-mono text-xs text-tinta/50">70–95 caracteres rinde mejor en Google Discover.</span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Bajada
        <textarea
          name="bajada"
          defaultValue={article?.bajada ?? ""}
          rows={2}
          className="focus-ring rounded border border-tinta/20 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Cuerpo (HTML)
        <textarea
          name="cuerpo_html"
          defaultValue={article?.cuerpo_html ?? ""}
          required
          rows={14}
          className="focus-ring rounded border border-tinta/20 px-3 py-2 font-mono text-sm"
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Imagen de portada (URL)
          <input
            name="imagen_portada"
            defaultValue={article?.imagen_portada ?? ""}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Texto alternativo de la imagen
          <input
            name="alt_imagen"
            defaultValue={article?.alt_imagen ?? ""}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Categoría
          <select
            name="categoria_id"
            defaultValue={article?.categoria_id ?? ""}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Barrio
          <input
            name="barrio"
            defaultValue={article?.barrio ?? ""}
            placeholder="Pichincha, Abasto…"
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Autor
          <input
            name="autor"
            defaultValue={article?.autor ?? "Redacción"}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Meta título (SEO)
          <input
            name="meta_title"
            defaultValue={article?.meta_title ?? ""}
            maxLength={95}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Meta descripción (SEO)
          <input
            name="meta_description"
            defaultValue={article?.meta_description ?? ""}
            maxLength={160}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
      </div>

      {article?.fuente_nombre && (
        <p className="rounded border border-acento2/30 bg-acento2/5 p-3 font-mono text-xs">
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

      <label className="flex flex-col gap-1 text-sm">
        Estado
        <select
          name="estado"
          defaultValue={article?.estado ?? "borrador"}
          className="focus-ring w-48 rounded border border-tinta/20 px-3 py-2"
        >
          <option value="borrador">Borrador</option>
          <option value="revision">En revisión</option>
          <option value="publicado">Publicado</option>
        </select>
      </label>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
