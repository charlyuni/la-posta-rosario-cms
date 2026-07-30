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
      className="focus-ring rounded-lg bg-accent px-5 py-2.5 font-medium text-bg transition-opacity hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Guardando…" : "Guardar cambios"}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="card flex flex-col gap-4 p-5">
      <legend className="mb-1 px-1 font-mono text-xs uppercase tracking-wide text-accent2">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="font-mono text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Toggle({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-line bg-surface2 p-3 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 accent-accent"
      />
      <span>
        <span className="block font-medium text-ink">{label}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
    </label>
  );
}

function ColorField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          name={name}
          defaultValue={defaultValue}
          className="h-8 w-10 cursor-pointer rounded border border-line bg-surface2"
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
          className="field w-24 font-mono text-xs"
        />
      </span>
    </label>
  );
}

export default function ConfigForm({ config }: { config: SiteConfig }) {
  const [state, formAction] = useFormState(saveConfig, undefined);

  return (
    <form id="config-form" action={formAction} className="flex max-w-2xl flex-col gap-6">
      <Section title="Marca">
        <Field label="Nombre del portal">
          <input name="nombre_portal" defaultValue={config.nombre_portal} required className="field" />
        </Field>
        <Field label="Tagline">
          <input name="tagline" defaultValue={config.tagline} className="field" />
        </Field>
        <Field label="URL del logo">
          <input name="logo_url" defaultValue={config.logo_url ?? ""} placeholder="https://…" className="field" />
        </Field>
      </Section>

      <Section title="Paleta (validada por contraste WCAG AA)">
        <ColorField name="color_tinta" label="Tinta (texto)" defaultValue={config.color_tinta} />
        <ColorField name="color_papel" label="Papel (fondo)" defaultValue={config.color_papel} />
        <ColorField name="color_acento" label="Acento" defaultValue={config.color_acento} />
        <ColorField name="color_acento2" label="Acento secundario" defaultValue={config.color_acento2} />
        <ColorField name="color_urgente" label="Urgente / en vivo" defaultValue={config.color_urgente} />
      </Section>

      <Section title="Contacto">
        <Field label="Email de contacto">
          <input name="email_contacto" type="email" defaultValue={config.email_contacto ?? ""} className="field" />
        </Field>
        <Field label="WhatsApp">
          <input
            name="telefono_whatsapp"
            defaultValue={config.telefono_whatsapp ?? ""}
            placeholder="+54 9 341…"
            className="field"
          />
        </Field>
        <Field label="Dirección">
          <input name="direccion" defaultValue={config.direccion ?? ""} className="field" />
        </Field>
      </Section>

      <Section title="Redes sociales">
        <Field label="X / Twitter (usuario)">
          <input
            name="twitter"
            defaultValue={config.redes_json?.twitter ?? ""}
            placeholder="@laposta_rosario"
            className="field"
          />
        </Field>
        <Field label="Instagram (usuario)">
          <input
            name="instagram"
            defaultValue={config.redes_json?.instagram ?? ""}
            placeholder="@laposta_rosario"
            className="field"
          />
        </Field>
        <Field label="Facebook (página)">
          <input name="facebook" defaultValue={config.redes_json?.facebook ?? ""} className="field" />
        </Field>

        <Toggle
          name="auto_publicar_ingesta"
          label="Auto-publicar notas generadas por IA"
          hint="Sin pasar por la cola de revisión editorial"
          defaultChecked={config.auto_publicar_ingesta}
        />
        <Toggle
          name="auto_publicar_redes"
          label="Publicar automáticamente en X/Instagram"
          hint="Al pasar una nota a estado publicado"
          defaultChecked={config.auto_publicar_redes}
        />
      </Section>

      <Section title="Técnico">
        <Field label="Dominio">
          <input
            name="dominio"
            defaultValue={config.dominio ?? ""}
            placeholder="laposta-rosario.com.ar"
            className="field"
          />
        </Field>
        <Field label="ID de analítica">
          <input name="analytics_id" defaultValue={config.analytics_id ?? ""} className="field" />
        </Field>
      </Section>

      {state?.error ? (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p role="status" className="rounded-lg border border-accent2/30 bg-accent2/10 p-3 text-sm text-accent2">
          Guardado.
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
