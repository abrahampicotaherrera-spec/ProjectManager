export interface Filtros {
  busqueda: string;
  estados: string[];
  prioridades: string[];
  tipos: string[];
  asignados: string[];
}

export const FILTROS_VACIOS: Filtros = {
  busqueda: "",
  estados: [],
  prioridades: [],
  tipos: [],
  asignados: [],
};

const STORAGE_KEY = "gestor-proyectos:filtros";

export function cargarFiltros(): Filtros {
  if (typeof window === "undefined") return FILTROS_VACIOS;
  try {
    const guardado = window.localStorage.getItem(STORAGE_KEY);
    if (!guardado) return FILTROS_VACIOS;
    const parsed = JSON.parse(guardado) as Partial<Filtros>;
    return {
      busqueda: "", // la búsqueda de texto no se persiste, solo los filtros de selección
      estados: parsed.estados ?? [],
      prioridades: parsed.prioridades ?? [],
      tipos: parsed.tipos ?? [],
      asignados: parsed.asignados ?? [],
    };
  } catch {
    return FILTROS_VACIOS;
  }
}

export function guardarFiltros(f: Filtros): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
}
