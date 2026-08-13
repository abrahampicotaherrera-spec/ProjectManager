-- ============================================================
-- Gestor de Proyectos — esquema de Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Listas editables (ASIGNADO y EJECUTIVO COMERCIAL): "hacer una
-- lista en la que se pueda crear o seleccionar"
-- ------------------------------------------------------------
create table if not exists personas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rol text not null check (rol in ('ASIGNADO', 'EJECUTIVO_COMERCIAL')),
  created_at timestamptz not null default now(),
  unique (nombre, rol)
);

-- ------------------------------------------------------------
-- Configuración general (carpeta base local para el campo RUTA)
-- ------------------------------------------------------------
create table if not exists configuracion (
  id int primary key default 1,
  carpeta_base text not null default 'C:\Users\abraham.picota\OneDrive - Pagero AB\Proyectos',
  constraint solo_una_fila check (id = 1)
);
insert into configuracion (id) values (1) on conflict (id) do nothing;

-- ------------------------------------------------------------
-- Proyectos / Servicios
-- ------------------------------------------------------------
create table if not exists proyectos (
  id uuid primary key default gen_random_uuid(),
  numero int not null unique,
  tipo_tarea text not null check (tipo_tarea in ('PROYECTO', 'SERVICIO')),
  cliente text not null,
  nombre_hubspot text,
  nv text,
  ruc text,
  dv text,
  estado text not null default 'Inicio' check (estado in (
    'Area Comercial', 'Inicio', 'Integración', 'Implementación', 'Pruebas',
    'Go Live / Hyper Care', 'Cerrado', 'Cancelado', 'Suspendido'
  )),
  tarea text,
  observaciones text,
  asignado text,
  ejecutivo_comercial text,
  pais text,
  prioridad text not null default 'Medio' check (prioridad in ('Bajo', 'Medio', 'Alto')),
  semanas_proyecto numeric,
  fecha_asignacion date,
  fecha_inicio date,
  fecha_finalizacion date,
  proyecto_con_gantt boolean not null default false,
  ruta_gantt text,
  porcentaje_avance numeric check (porcentaje_avance >= 0 and porcentaje_avance <= 100),
  ruta_hubspot text,
  codigo_cliente_xdoc text,
  conectividad text check (conectividad in ('API', 'xDoc', 'xDoc Cloud')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- El "No." sigue el consecutivo del último proyecto/servicio creado
create sequence if not exists proyectos_numero_seq owned by proyectos.numero;
select setval('proyectos_numero_seq', coalesce((select max(numero) from proyectos), 0));

create or replace function set_numero_proyecto()
returns trigger as $$
begin
  if new.numero is null then
    new.numero := nextval('proyectos_numero_seq');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_numero_proyecto on proyectos;
create trigger trg_set_numero_proyecto
  before insert on proyectos
  for each row execute function set_numero_proyecto();

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_proyectos_updated_at on proyectos;
create trigger trg_proyectos_updated_at
  before update on proyectos
  for each row execute function set_updated_at();

create index if not exists idx_proyectos_estado on proyectos (estado);
create index if not exists idx_proyectos_asignado on proyectos (asignado);
create index if not exists idx_proyectos_prioridad on proyectos (prioridad);

-- ------------------------------------------------------------
-- RLS: app de uso interno de un solo usuario/equipo con la
-- anon key. Se deja acceso abierto de lectura/escritura para
-- simplicidad local. Si vas a desplegarla en Vercel de forma
-- pública, agrega autenticación (Supabase Auth) y restringe
-- estas políticas antes de compartir la URL.
-- ------------------------------------------------------------
alter table proyectos enable row level security;
alter table personas enable row level security;
alter table configuracion enable row level security;

drop policy if exists "proyectos_all" on proyectos;
create policy "proyectos_all" on proyectos for all using (true) with check (true);

drop policy if exists "personas_all" on personas;
create policy "personas_all" on personas for all using (true) with check (true);

drop policy if exists "configuracion_all" on configuracion;
create policy "configuracion_all" on configuracion for all using (true) with check (true);
