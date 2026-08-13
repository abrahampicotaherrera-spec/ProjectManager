# Gestor de Proyectos

App interna para dar seguimiento a los proyectos y servicios de clientes
(implementación de facturación electrónica), con los mismos campos que
usabas en tu tabla de referencia: estado, prioridad, fechas, % de avance,
GANTT, HubSpot, XDOC, etc.

Stack: **Next.js 14 + TypeScript + Tailwind + Supabase**, pensado para
correr local con `npm run dev` y desplegarse en Vercel igual que hiciste
con `mundial-familiar`.

## 1. Crear el proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) → **New project**.
2. Cuando esté listo, ve a **SQL Editor → New query**, pega todo el
   contenido de [`supabase/schema.sql`](./supabase/schema.sql) y
   ejecútalo. Esto crea las tablas `proyectos`, `personas` y
   `configuracion`, la numeración automática (`No.`) y las políticas de
   acceso.
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public` key

## 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Edita `.env.local` y pega tus credenciales:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Correr localmente

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Antes de crear tu primer proyecto, entra a **Configuración** (arriba a la
derecha) y ajusta la **carpeta base local**, que es la que arma el campo
`RUTA` automáticamente (`carpeta_base\N°-CLIENTE`). Por defecto viene con:

```
C:\Users\abraham.picota\OneDrive - Pagero AB\Proyectos
```

## 4. Subir a GitHub

```bash
git init
git add .
git commit -m "Gestor de proyectos: primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/gestor-proyectos.git
git push -u origin main
```

`.env.local` no se sube (está en `.gitignore`), así que tus credenciales
de Supabase quedan fuera del repo.

## 5. Desplegar en Vercel

1. En [vercel.com](https://vercel.com) → **Add New Project** → importa el
   repo de GitHub.
2. En **Environment Variables**, agrega las mismas dos variables de
   `.env.local`.
3. Deploy. Cada `git push` a `main` vuelve a desplegar automáticamente,
   igual que en `mundial-familiar`.

## Cómo se calculan los campos automáticos

| Campo | Cálculo |
|---|---|
| **No.** | Secuencia automática en la base de datos, sigue el consecutivo del último proyecto/servicio creado. |
| **Fecha proyectada final** | `Fecha inicio + Semanas de proyecto × 7 días` |
| **Cantidad de días disponibles** | `Fecha proyectada final − fecha de hoy` |
| **Ruta** | `Carpeta base (Configuración) + "N°" + "-" + CLIENTE` |

Los campos **Asignado** y **Ejecutivo comercial** son listas donde puedes
escribir un nombre nuevo (se guarda automáticamente) o elegir uno ya
existente — se administran también desde **Configuración**.

## Notas de seguridad

Las políticas de Supabase (RLS) quedan abiertas para que la app funcione
sin login, pensada como herramienta interna de un solo usuario/equipo. Si
vas a compartir la URL de Vercel con más personas o vas a manejar datos
sensibles de clientes de forma pública, agrega autenticación (Supabase
Auth) antes de compartir el enlace ampliamente.
