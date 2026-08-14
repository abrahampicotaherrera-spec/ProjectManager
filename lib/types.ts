export const TIPOS_TAREA = ["PROYECTO", "SERVICIO"] as const;
export type TipoTarea = (typeof TIPOS_TAREA)[number];

// Orden de la tubería principal (para el stepper visual). Cancelado y
// Suspendido son estados de excepción y se muestran aparte.
export const ESTADOS_PIPELINE = [
  "Area Comercial",
  "Inicio",
  "Integración",
  "Implementación",
  "Pruebas",
  "Go Live / Hyper Care",
  "Cerrado",
] as const;

export const ESTADOS_EXCEPCION = ["Cancelado", "Suspendido"] as const;

export const ESTADOS = [...ESTADOS_PIPELINE, ...ESTADOS_EXCEPCION] as const;
export type Estado = (typeof ESTADOS)[number];

export const PRIORIDADES = ["Bajo", "Medio", "Alto"] as const;
export type Prioridad = (typeof PRIORIDADES)[number];

export const CONECTIVIDADES = ["API", "xDoc", "xDoc Cloud"] as const;
export type Conectividad = (typeof CONECTIVIDADES)[number];

export interface Proyecto {
  id: string;
  numero: number;
  tipo_tarea: TipoTarea;
  cliente: string;
  nombre_hubspot: string | null;
  nv: string | null;
  ruc: string | null;
  dv: string | null;
  estado: Estado;
  tarea: string | null;
  observaciones: string | null;
  asignado: string | null;
  ejecutivo_comercial: string | null;
  pais: string | null;
  prioridad: Prioridad;
  semanas_proyecto: number | null;
  fecha_asignacion: string | null; // ISO date
  fecha_inicio: string | null; // ISO date
  fecha_finalizacion: string | null; // ISO date (fecha que pide el cliente)
  proyecto_con_gantt: boolean;
  ruta_gantt: string | null;
  porcentaje_avance: number | null;
  ruta_hubspot: string | null;
  codigo_cliente_xdoc: string | null;
  conectividad: Conectividad | null;
  created_at: string;
  updated_at: string;
}

export type ProyectoInput = Omit<Proyecto, "id" | "created_at" | "updated_at">;

export interface Persona {
  id: string;
  nombre: string;
  rol: "ASIGNADO" | "EJECUTIVO_COMERCIAL";
}

export interface Hito {
  id: string;
  proyecto_id: string;
  fecha: string; // ISO date
  nota: string;
  created_at: string;
}

export interface Reunion {
  id: string;
  proyecto_id: string;
  fecha: string; // ISO date
  asunto: string | null;
  asistentes: string | null;
  notas: string;
  created_at: string;
}

export interface Tarea {
  id: string;
  proyecto_id: string;
  texto: string;
  completada: boolean;
  importante: boolean;
  fecha_limite: string | null; // ISO date
  created_at: string;
  completada_en: string | null;
}
