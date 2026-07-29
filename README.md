# La Posta Rosario — CMS

Panel de administración y motor de automatización del portal de noticias
**La Posta Rosario**. Repositorio hermano: [`la-posta-rosario-web`](https://github.com/charlyuni/la-posta-rosario-web)
(portal público que lee de la misma base).

## Qué hay acá

```
app/
  login/          Acceso de redacción (Supabase Auth)
  admin/
    page.tsx       Dashboard: contadores + cola editorial
    config/        Marca, paleta (validada por contraste WCAG AA), contacto, redes
    articulos/     CRUD de notas
    fuentes/       Fuentes RSS/oficiales para la ingesta automática
lib/
  supabase/        Clientes de Supabase (server + middleware de sesión)
  types.ts         Tipos de la base, compartidos por toda la app
  contrast.ts       Validación de contraste WCAG AA para la paleta configurable
supabase/
  migrations/      Esquema de la base (site_config, articles, categories, sources, …)
  functions/        Edge Functions: ingesta de noticias y publicación en redes
```

## Setup

### 1. Variables de entorno

Copiá `.env.example` a `.env.local`. Los valores de `NEXT_PUBLIC_SUPABASE_URL` /
`NEXT_PUBLIC_SUPABASE_ANON_KEY` ya apuntan al proyecto Supabase dedicado
(`la-posta-rosario`, org `mvfiynmzgqaofhiwalyy`, región `sa-east-1`).

Para que la ingesta automática y la publicación en redes funcionen hace falta
completar además (estas SÍ son secretas, nunca van a `NEXT_PUBLIC_*`):

- `SUPABASE_SERVICE_ROLE_KEY` — desde el dashboard de Supabase (Settings → API).
- `ANTHROPIC_API_KEY` — para la reescritura de notas.
- `TWITTER_API_KEY/SECRET` + `TWITTER_ACCESS_TOKEN/SECRET` — cuenta de
  desarrollador en developer.x.com (plan Free alcanza).
- `INSTAGRAM_BUSINESS_ACCOUNT_ID` + `INSTAGRAM_ACCESS_TOKEN` — requiere una
  cuenta de Instagram Business/Creator vinculada a una Página de Facebook, y
  una app en Meta for Developers con el permiso `instagram_content_publish`
  aprobado.

### 2. Primer editor

La tabla `editors` controla quién puede entrar al panel. Después de crear un
usuario en Supabase Auth (dashboard → Authentication → Users → Add user),
insertalo como editor:

```sql
insert into editors (id, nombre, rol) values ('<uuid-del-usuario>', 'Tu nombre', 'admin');
```

### 3. Desarrollo local

```bash
npm install
npm run dev   # http://localhost:3000
```

## Accesibilidad y contenido

- No se puede pasar una nota a "revisión" o "publicado" sin imagen de portada
  **y** su texto alternativo — se valida en `app/admin/articulos/actions.ts`.
- La paleta de `site_config` no se guarda si el contraste tinta/papel cae por
  debajo de 4.5:1 (WCAG AA) — ver `lib/contrast.ts`.

## Automatización (ver `supabase/functions/`)

- `ingest-news`: lee las fuentes activas de la tabla `sources`, reescribe cada
  nota con IA (transformativo, nunca resumen/traducción del original) y la
  deja en `revision` (o `publicado` si `site_config.auto_publicar_ingesta` está
  activo). **Guarda siempre la atribución** (`fuente_original_url`,
  `fuente_nombre`) — leer el aviso de riesgo legal en el plan de producto antes
  de escalar el auto-publicado sin revisión humana.
- `publish-social`: se dispara cuando una nota pasa a `publicado` y
  `site_config.auto_publicar_redes` está activo; publica en X e Instagram y
  registra el resultado en `social_posts_log`.

Ambas son Supabase Edge Functions (Deno). Se despliegan con:

```bash
supabase functions deploy ingest-news
supabase functions deploy publish-social
```

Y se programan desde el dashboard de Supabase (Database → Cron Jobs) o con
`pg_cron`, por ejemplo cada 20 minutos para `ingest-news`.
