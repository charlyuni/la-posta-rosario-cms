-- La Posta Rosario — esquema inicial
-- Convención: nombres de tabla/columna en español, siguiendo el dominio del producto.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- site_config: fila única con todo lo "customer configurable" desde el panel.
-- ---------------------------------------------------------------------------
create table public.site_config (
  id smallint primary key default 1 check (id = 1),
  nombre_portal text not null default 'La Posta Rosario',
  tagline text not null default 'Las noticias de Rosario, sin vueltas',
  logo_url text,
  favicon_url text,
  color_tinta text not null default '#15181A',
  color_papel text not null default '#EEF1EC',
  color_acento text not null default '#C9821E',
  color_acento2 text not null default '#1F6F68',
  color_urgente text not null default '#B8371F',
  email_contacto text,
  telefono_whatsapp text,
  direccion text,
  redes_json jsonb not null default '{}'::jsonb, -- { "twitter": "...", "instagram": "...", "facebook": "..." }
  dominio text,
  analytics_id text,
  auto_publicar_ingesta boolean not null default false,
  auto_publicar_redes boolean not null default false,
  actualizado_en timestamptz not null default now()
);

insert into public.site_config (id) values (1);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  descripcion text,
  color text,
  orden smallint not null default 0,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- editors: usuarios de auth.users habilitados para administrar el CMS
-- ---------------------------------------------------------------------------
create table public.editors (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  rol text not null default 'editor' check (rol in ('editor', 'admin')),
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sources: fuentes para la ingesta automática
-- ---------------------------------------------------------------------------
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('rss', 'oficial', 'api')),
  url text not null,
  activo boolean not null default true,
  confiabilidad smallint not null default 3 check (confiabilidad between 1 and 5),
  ultima_revision timestamptz,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media_assets
-- ---------------------------------------------------------------------------
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt_text text not null,
  credito text,
  ancho int,
  alto int,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  slug text not null unique,
  bajada text,
  cuerpo_html text not null default '',
  imagen_portada text,
  alt_imagen text,
  categoria_id uuid references public.categories (id) on delete set null,
  barrio text,
  autor text not null default 'Redacción',
  estado text not null default 'borrador' check (estado in ('borrador', 'revision', 'publicado')),
  fuente_original_url text,
  fuente_nombre text,
  generado_por_ia boolean not null default false,
  meta_title text,
  meta_description text,
  schema_jsonld jsonb,
  publicado_en timestamptz,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index articles_estado_publicado_idx on public.articles (estado, publicado_en desc);
create index articles_categoria_idx on public.articles (categoria_id);
create index articles_barrio_idx on public.articles (barrio);

-- ---------------------------------------------------------------------------
-- social_posts_log
-- ---------------------------------------------------------------------------
create table public.social_posts_log (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles (id) on delete cascade,
  plataforma text not null check (plataforma in ('twitter', 'instagram')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'publicado', 'error')),
  post_id_externo text,
  error text,
  intentos int not null default 0,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- subscribers (newsletter)
-- ---------------------------------------------------------------------------
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  confirmado boolean not null default false,
  creado_en timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger para articles y site_config
-- ---------------------------------------------------------------------------
create function public.set_actualizado_en()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_set_actualizado_en
  before update on public.articles
  for each row execute function public.set_actualizado_en();

create function public.set_config_actualizado_en()
returns trigger as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$ language plpgsql;

create trigger site_config_set_actualizado_en
  before update on public.site_config
  for each row execute function public.set_config_actualizado_en();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.site_config enable row level security;
alter table public.categories enable row level security;
alter table public.editors enable row level security;
alter table public.sources enable row level security;
alter table public.media_assets enable row level security;
alter table public.articles enable row level security;
alter table public.social_posts_log enable row level security;
alter table public.subscribers enable row level security;

-- Lectura pública (portal web usa la clave anónima)
create policy "site_config: lectura pública" on public.site_config
  for select using (true);

create policy "categories: lectura pública" on public.categories
  for select using (true);

create policy "media_assets: lectura pública" on public.media_assets
  for select using (true);

create policy "articles: lectura pública de publicados" on public.articles
  for select using (estado = 'publicado');

-- Escritura: solo usuarios presentes en editors
create policy "site_config: editores pueden actualizar" on public.site_config
  for update using (exists (select 1 from public.editors e where e.id = auth.uid()));

create policy "categories: editores administran" on public.categories
  for all using (exists (select 1 from public.editors e where e.id = auth.uid()))
  with check (exists (select 1 from public.editors e where e.id = auth.uid()));

create policy "sources: editores administran" on public.sources
  for all using (exists (select 1 from public.editors e where e.id = auth.uid()))
  with check (exists (select 1 from public.editors e where e.id = auth.uid()));

create policy "media_assets: editores administran" on public.media_assets
  for insert with check (exists (select 1 from public.editors e where e.id = auth.uid()));

create policy "articles: editores ven y administran todo" on public.articles
  for all using (exists (select 1 from public.editors e where e.id = auth.uid()))
  with check (exists (select 1 from public.editors e where e.id = auth.uid()));

create policy "social_posts_log: editores leen" on public.social_posts_log
  for select using (exists (select 1 from public.editors e where e.id = auth.uid()));

-- Nota: esta política NO puede volver a consultar `editors` en su USING —
-- Postgres re-evalúa las políticas de la tabla contra sí misma en cada
-- subconsulta, y eso produce recursión infinita (42P17). Cada editor ve
-- únicamente su propia fila, que es lo único que necesita el CMS hoy.
create policy "editors: pueden verse a sí mismos" on public.editors
  for select using (id = auth.uid());

-- Newsletter: alta pública, lectura solo editores
create policy "subscribers: alta pública" on public.subscribers
  for insert with check (true);

create policy "subscribers: editores leen" on public.subscribers
  for select using (exists (select 1 from public.editors e where e.id = auth.uid()));

-- Seed de categorías iniciales
insert into public.categories (nombre, slug, descripcion, color, orden) values
  ('Ciudad', 'ciudad', 'Actualidad y vida cotidiana de Rosario', '#1F6F68', 1),
  ('Policiales', 'policiales', 'Seguridad y justicia', '#B8371F', 2),
  ('Política', 'politica', 'Municipalidad, provincia y nación', '#C9821E', 3),
  ('Deportes', 'deportes', 'Newell''s, Central y deporte local', '#1F6F68', 4),
  ('Economía', 'economia', 'Precios, comercio y trabajo en la región', '#C9821E', 5),
  ('Cultura', 'cultura', 'Agenda, espectáculos y vida cultural', '#1F6F68', 6);
