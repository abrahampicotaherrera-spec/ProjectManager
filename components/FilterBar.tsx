"use client";

import { ESTADOS, PRIORIDADES, TIPOS_TAREA } from "@/lib/types";
import { Filtros, FILTROS_VACIOS } from "@/lib/filtros";
import MultiSelectFilter from "./MultiSelectFilter";

export default function FilterBar({
  filtros,
  onChange,
  asignados,
}: {
  filtros: Filtros;
  onChange: (f: Filtros) => void;
  asignados: string[];
}) {
  const set = (patch: Partial<Filtros>) => onChange({ ...filtros, ...patch });

  const hayFiltros =
    filtros.busqueda ||
    filtros.estados.length > 0 ||
    filtros.prioridades.length > 0 ||
    filtros.tipos.length > 0 ||
    filtros.asignados.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={filtros.busqueda}
        onChange={(e) => set({ busqueda: e.target.value })}
        placeholder="Buscar cliente, NV, RUC…"
        className="w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
      />
      <MultiSelectFilter
        label="Tipo"
        opciones={[...TIPOS_TAREA]}
        seleccionadas={filtros.tipos}
        onChange={(v) => set({ tipos: v })}
      />
      <MultiSelectFilter
        label="Estado"
        opciones={[...ESTADOS]}
        seleccionadas={filtros.estados}
        onChange={(v) => set({ estados: v })}
      />
      <MultiSelectFilter
        label="Prioridad"
        opciones={[...PRIORIDADES]}
        seleccionadas={filtros.prioridades}
        onChange={(v) => set({ prioridades: v })}
      />
      <MultiSelectFilter
        label="Asignado"
        opciones={asignados}
        seleccionadas={filtros.asignados}
        onChange={(v) => set({ asignados: v })}
      />
      {hayFiltros && (
        <button
          onClick={() => onChange(FILTROS_VACIOS)}
          className="text-sm text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-ink-900"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
