export interface ColumnaDef {
  key: string;
  label: string;
}

// Columnas fijas que siempre se muestran (identifican la fila)
export const COLUMNAS_FIJAS = ["numero", "cliente"];

export const COLUMNAS_PROYECTO: ColumnaDef[] = [
  { key: "numero", label: "No." },
  { key: "tipo_tarea", label: "Tipo de tarea" },
  { key: "cliente", label: "Cliente" },
  { key: "nombre_hubspot", label: "Nombre HubSpot" },
  { key: "nv", label: "NV" },
  { key: "ruc", label: "RUC" },
  { key: "dv", label: "DV" },
  { key: "estado", label: "Estado" },
  { key: "tarea", label: "Tarea" },
  { key: "observaciones", label: "Observaciones" },
  { key: "asignado", label: "Asignado" },
  { key: "ejecutivo_comercial", label: "Ejecutivo comercial" },
  { key: "pais", label: "País" },
  { key: "prioridad", label: "Prioridad" },
  { key: "semanas_proyecto", label: "Semanas de proyecto" },
  { key: "fecha_asignacion", label: "Fecha asignación" },
  { key: "fecha_inicio", label: "Fecha inicio" },
  { key: "fecha_proyectada_final", label: "Fecha proyectada final" },
  { key: "dias_disponibles", label: "Cantidad de días disponibles" },
  { key: "fecha_finalizacion", label: "Fecha finalización" },
  { key: "ruta", label: "Ruta" },
  { key: "porcentaje_avance", label: "% Avance" },
  { key: "proyecto_con_gantt", label: "Proyecto con GANTT" },
  { key: "ruta_gantt", label: "Ruta GANTT" },
  { key: "ruta_hubspot", label: "Ruta HubSpot" },
  { key: "codigo_cliente_xdoc", label: "Código cliente XDOC" },
  { key: "conectividad", label: "Conectividad" },
];

const STORAGE_KEY = "gestor-proyectos:columnas-visibles";

function todasVisibles(): Record<string, boolean> {
  return Object.fromEntries(COLUMNAS_PROYECTO.map((c) => [c.key, true]));
}

export function cargarColumnasVisibles(): Record<string, boolean> {
  if (typeof window === "undefined") return todasVisibles();
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (!guardado) return todasVisibles();
    const parsed = JSON.parse(guardado) as Record<string, boolean>;
    // Si se agregó una columna nueva después de guardar la preferencia,
    // que aparezca visible por defecto en vez de desaparecer.
    return Object.fromEntries(
      COLUMNAS_PROYECTO.map((c) => [c.key, parsed[c.key] ?? true])
    );
  } catch {
    return todasVisibles();
  }
}

export function guardarColumnasVisibles(v: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
}

const STORAGE_KEY_ORDEN = "gestor-proyectos:orden-columnas";

export function ordenDefault(): string[] {
  return COLUMNAS_PROYECTO.map((c) => c.key);
}

export function cargarOrdenColumnas(): string[] {
  if (typeof window === "undefined") return ordenDefault();
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY_ORDEN);
    if (!guardado) return ordenDefault();
    const parsed = JSON.parse(guardado) as string[];
    const clavesValidas = COLUMNAS_PROYECTO.map((c) => c.key);
    const validos = parsed.filter((k) => clavesValidas.includes(k));
    // columnas nuevas que no existían cuando se guardó el orden, al final
    const faltantes = clavesValidas.filter((k) => !validos.includes(k));
    return [...validos, ...faltantes];
  } catch {
    return ordenDefault();
  }
}

export function guardarOrdenColumnas(orden: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY_ORDEN, JSON.stringify(orden));
}
