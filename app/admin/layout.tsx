import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";
import { IconGrid, IconFile, IconRss, IconGear, IconLogout, IconExternal } from "@/components/icons";
import SiteName from "@/components/site-name";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Panel", icon: IconGrid },
  { href: "/admin/articulos", label: "Notas", icon: IconFile },
  { href: "/admin/fuentes", label: "Fuentes", icon: IconRss },
  { href: "/admin/config", label: "Configuración", icon: IconGear },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [{ data: config }, { data: userData }] = await Promise.all([
    supabase.from("site_config").select("nombre_portal, dominio").eq("id", 1).single(),
    supabase.auth.getUser(),
  ]);

  const nombrePortal = config?.nombre_portal ?? "La Posta Rosario";
  const sitioUrl = config?.dominio ? `https://${config.dominio}` : "/";

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-line bg-surface">
        <div className="px-5 py-6">
          <p className="font-mono text-[0.65rem] uppercase tracking-widest text-accent2">Redacción</p>
          <h1 className="mt-0.5 font-serif text-lg font-bold leading-tight text-ink">
            <SiteName nombre={nombrePortal} />
          </h1>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted no-underline transition-colors hover:bg-surface2 hover:text-ink"
              >
                <Icon className="text-muted" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-line px-3 py-4">
          <a
            href={sitioUrl}
            target="_blank"
            rel="noreferrer"
            className="focus-ring flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted no-underline transition-colors hover:bg-surface2 hover:text-ink"
          >
            <IconExternal className="text-muted" />
            Ver sitio
          </a>
          <div className="mt-1 flex items-center justify-between gap-2 px-3 py-2">
            <span className="truncate font-mono text-xs text-muted" title={userData?.user?.email ?? ""}>
              {userData?.user?.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Salir"
                title="Salir"
                className="focus-ring rounded p-1 text-muted transition-colors hover:text-danger"
              >
                <IconLogout />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
