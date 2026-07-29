import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Admin — La Posta Rosario",
  description: "Panel de administración del portal La Posta Rosario.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
