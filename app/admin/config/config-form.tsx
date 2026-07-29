"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveConfig } from "../actions";
import type { SiteConfig } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="focus-ring rounded bg-tinta px-4 py-2 font-medium text-papel disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

function ColorField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          name={name}
          defaultValue={defaultValue}
          className="h-8 w-10 cursor-pointer rounded border border-tinta/20"
        />
        <input
          type="text"
          form="config-form"
          aria-label={`${label} (hex)`}
          defaultValue={defaultValue}
          onChange={(e) => {
            const colorInput = e.currentTarget.previousElementSibling as HTMLInputElement | null;
            if (colorInput && /^#[0-9a-fA-F]{6}$/.test(e.currentTarget.value)) {
              colorInput.value = e.currentTarget.value;
            }
          }}
          className="focus-ring w-24 rounded border border-tinta/20 px-2 py-1 font-mono text-xs"
        />
      </span>
    </label>
  );
}

export default function ConfigForm({ config }: { config: SiteConfig }) {
  const [state, formAction] = useFormState(saveConfig, undefined);

  return (
    <form id="config-form" action={formAction} className="flex max-w-2xl flex-col gap-8">
      <fieldset className="flex flex-col gap-3 rounded border border-tinta/15 bg-white p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wide text-acento2">Marca</legend>
        <label className="flex flex-col gap-1 text-sm">
          Nombre del portal
          <input
            name="nombre_portal"
            defaultValue={config.nombre_portal}
            required
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tagline
          <input
            name="tagline"
            defaultValue={config.tagline}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          URL del logo
          <input
            name="logo_url"
            defaultValue={config.logo_url ?? ""}
            placeholder="https://…"
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded border border-tinta/15 bg-white p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wide text-acento2">
          Paleta (validada por contraste WCAG AA)
        </legend>
        <ColorField name="color_tinta" label="Tinta (texto)" defaultValue={config.color_tinta} />
        <ColorField name="color_papel" label="Papel (fondo)" defaultValue={config.color_papel} />
        <ColorField name="color_acento" label="Acento" defaultValue={config.color_acento} />
        <ColorField name="color_acento2" label="Acento secundario" defaultValue={config.color_acento2} />
        <ColorField name="color_urgente" label="Urgente / en vivo" defaultValue={config.color_urgente} />
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded border border-tinta/15 bg-white p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wide text-acento2">Contacto</legend>
        <label className="flex flex-col gap-1 text-sm">
          Email de contacto
          <input
            name="email_contacto"
            type="email"
            defaultValue={config.email_contacto ?? ""}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          WhatsApp
          <input
            name="telefono_whatsapp"
            defaultValue={config.telefono_whatsapp ?? ""}
            placeholder="+54 9 341…"
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Dirección
          <input
            name="direccion"
            defaultValue={config.direccion ?? ""}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded border border-tinta/15 bg-white p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wide text-acento2">Redes sociales</legend>
        <label className="flex flex-col gap-1 text-sm">
          X / Twitter (usuario)
          <input
            name="twitter"
            defaultValue={config.redes_json?.twitter ?? ""}
            placeholder="@laposta_rosario"
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Instagram (usuario)
          <input
            name="instagram"
            defaultValue={config.redes_json?.instagram ?? ""}
            placeholder="@laposta_rosario"
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Facebook (página)
          <input
            name="facebook"
            defaultValue={config.redes_json?.facebook ?? ""}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="auto_publicar_ingesta" defaultChecked={config.auto_publicar_ingesta} />
          Auto-publicar notas generadas por IA sin revisión editorial
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="auto_publicar_redes" defaultChecked={config.auto_publicar_redes} />
          Publicar automáticamente en X/Instagram al publicar una nota
        </label>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded border border-tinta/15 bg-white p-4">
        <legend className="px-1 font-mono text-xs uppercase tracking-wide text-acento2">Técnico</legend>
        <label className="flex flex-col gap-1 text-sm">
          Dominio
          <input
            name="dominio"
            defaultValue={config.dominio ?? ""}
            placeholder="laposta-rosario.com.ar"
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          ID de analítica
          <input
            name="analytics_id"
            defaultValue={config.analytics_id ?? ""}
            className="focus-ring rounded border border-tinta/20 px-3 py-2"
          />
        </label>
      </fieldset>

      {state?.error ? (
        <p role="alert" className="text-sm text-urgente">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="text-sm text-acento2">
          Guardado.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
