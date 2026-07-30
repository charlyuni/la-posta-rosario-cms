import Link from "next/link";
import { signOut } from "./actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/articulos", label: "Notas" },
  { href: "/admin/fuentes", label: "Fuentes" },
  { href: "/admin/config", label: "Configuración" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-6">
      <header className="mb-8 flex items-center justify-between border-b-2 border-tinta pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-acento2">Redacción</p>
          <h1 className="font-serif text-2xl font-bold">La Posta Rosario</h1>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="focus-ring no-underline hover:underline">
              {item.label}
            </Link>
          ))}
          <form action={signOut}>
            <button type="submit" className="focus-ring text-urgente">
              Salir
            </button>
          </form>
        </nav>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
