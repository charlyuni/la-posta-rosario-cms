import type { Config } from "tailwindcss";

// Sistema de diseño del panel (distinto del portal público, que es
// config-driven desde site_config). Estética "consola de redacción":
// oscuro, tipografía mono para datos/estado, acento cálido reservado
// para acciones primarias.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0D0F12",
        surface: "#15181C",
        surface2: "#1C2026",
        line: "rgba(232, 230, 223, 0.09)",
        ink: "#E8E6DF",
        muted: "#8B9199",
        accent: "#E2A54C",
        accent2: "#4FB3A9",
        danger: "#FF7A5C",
      },
      fontFamily: {
        serif: ["Georgia", "Iowan Old Style", "Palatino Linotype", "serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
