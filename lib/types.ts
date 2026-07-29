export type EstadoArticulo = "borrador" | "revision" | "publicado";
export type TipoFuente = "rss" | "oficial" | "api";
export type PlataformaSocial = "twitter" | "instagram";

export interface SiteConfig {
  id: 1;
  nombre_portal: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  color_tinta: string;
  color_papel: string;
  color_acento: string;
  color_acento2: string;
  color_urgente: string;
  email_contacto: string | null;
  telefono_whatsapp: string | null;
  direccion: string | null;
  redes_json: Record<string, string>;
  dominio: string | null;
  analytics_id: string | null;
  auto_publicar_ingesta: boolean;
  auto_publicar_redes: boolean;
  actualizado_en: string;
}

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  color: string | null;
  orden: number;
  creado_en: string;
}

export interface Article {
  id: string;
  titulo: string;
  slug: string;
  bajada: string | null;
  cuerpo_html: string;
  imagen_portada: string | null;
  alt_imagen: string | null;
  categoria_id: string | null;
  barrio: string | null;
  autor: string;
  estado: EstadoArticulo;
  fuente_original_url: string | null;
  fuente_nombre: string | null;
  generado_por_ia: boolean;
  meta_title: string | null;
  meta_description: string | null;
  schema_jsonld: Record<string, unknown> | null;
  publicado_en: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface Source {
  id: string;
  nombre: string;
  tipo: TipoFuente;
  url: string;
  activo: boolean;
  confiabilidad: number;
  ultima_revision: string | null;
  creado_en: string;
}

export interface SocialPostLog {
  id: string;
  article_id: string;
  plataforma: PlataformaSocial;
  estado: "pendiente" | "publicado" | "error";
  post_id_externo: string | null;
  error: string | null;
  intentos: number;
  creado_en: string;
}
