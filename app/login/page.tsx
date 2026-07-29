import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-1 font-serif text-3xl font-bold">La Posta Rosario</h1>
      <p className="mb-6 text-sm text-tinta/70">Acceso de redacción</p>
      <LoginForm />
    </main>
  );
}
