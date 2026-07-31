export default function SiteName({ nombre, className }: { nombre: string; className?: string }) {
  const palabras = nombre.trim().split(" ");
  const ciudad = palabras.length > 1 ? palabras.pop() : null;
  const resto = palabras.join(" ");

  return (
    <span className={className}>
      {resto}
      {ciudad && <span className="text-accent">{resto ? ` ${ciudad}` : ciudad}</span>}
    </span>
  );
}
