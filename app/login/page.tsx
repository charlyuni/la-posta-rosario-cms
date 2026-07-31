import LoginForm from "./login-form";
import SiteName from "@/components/site-name";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-accent2">Redacción</p>
        <h1 className="mb-1 font-serif text-3xl font-bold text-ink">
          <SiteName nombre="La Posta Rosario" />
        </h1>
        <p className="mb-8 text-sm text-muted">Panel de administración</p>
        <div className="card p-6">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
