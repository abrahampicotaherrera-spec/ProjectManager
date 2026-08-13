"use client";

import { ESTADOS, PRIORIDADES, TIPOS_TAREA } from "@/lib/types";

export interface Filtros {
  busqueda: string;
  estado: string;
  prioridad: string;
  tipoTarea: string;
  asignado: string;
}

export const FILTROS_VACIOS: Filtros = {
  busqueda: "",
  estado: "",
  prioridad: "",
  tipoTarea: "",
  asignado: "",
};

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

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        value={filtros.busqueda}
        onChange={(e) => set({ busqueda: e.target.value })}
        placeholder="Buscar cliente, NV, RUC…"
        className="w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
      />
      <select
        value={filtros.tipoTarea}
        onChange={(e) => set({ tipoTarea: e.target.value })}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none"
      >
        <option value="">Todos los tipos</option>
        {TIPOS_TAREA.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <select
        value={filtros.estado}
        onChange={(e) => set({ estado: e.target.value })}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none"
      >
        <option value="">Todos los estados</option>
        {ESTADOS.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
      <select
        value={filtros.prioridad}
        onChange={(e) => set({ prioridad: e.target.value })}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none"
      >
        <option value="">Toda prioridad</option>
        {PRIORIDADES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
      <select
        value={filtros.asignado}
        onChange={(e) => set({ asignado: e.target.value })}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none"
      >
        <option value="">Todo asignado</option>
        {asignados.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
      {(filtros.busqueda ||
        filtros.estado ||
        filtros.prioridad ||
        filtros.tipoTarea ||
        filtros.asignado) && (
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
