"use client";

import { Proyecto } from "@/lib/types";
import {
  calcularDiasDisponibles,
  calcularFechaProyectadaFinal,
  formatFecha,
} from "@/lib/calculations";
import EstadoPill from "./EstadoPill";

const PRIORIDAD_DOT: Record<string, string> = {
  Alto: "bg-rust-500",
  Medio: "bg-clay-500",
  Bajo: "bg-brand-400",
};

export default function ProjectTable({
  proyectos,
  onSelect,
}: {
  proyectos: Proyecto[];
  onSelect: (p: Proyecto) => void;
}) {
  if (proyectos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
        <p className="text-sm font-medium text-ink-800">
          No hay proyectos que coincidan con los filtros
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Ajusta la búsqueda o crea un nuevo proyecto para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="thin-scroll overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="w-full min-w-[1100px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">No.</th>
            <th className="px-4 py-3 font-medium">Cliente</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium">Prioridad</th>
            <th className="px-4 py-3 font-medium">Asignado</th>
            <th className="px-4 py-3 font-medium">Ejecutivo comercial</th>
            <th className="px-4 py-3 font-medium">País</th>
            <th className="px-4 py-3 font-medium">Fecha proyectada final</th>
            <th className="px-4 py-3 font-medium">Días disponibles</th>
            <th className="px-4 py-3 font-medium">% Avance</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => {
            const fechaFinal = calcularFechaProyectadaFinal(
              p.fecha_inicio,
              p.semanas_proyecto
            );
            const dias = calcularDiasDisponibles(fechaFinal);
            return (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-brand-50/40"
              >
                <td className="px-4 py-3 font-mono text-xs text-slate-500">
                  {p.numero}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-ink-900">{p.cliente}</div>
                  {p.nombre_hubspot && (
                    <div className="text-xs text-slate-400">
                      {p.nombre_hubspot}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{p.tipo_tarea}</td>
                <td className="px-4 py-3">
                  <EstadoPill estado={p.estado} />
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        PRIORIDAD_DOT[p.prioridad] ?? "bg-slate-300"
                      }`}
                    />
                    {p.prioridad}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.asignado || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {p.ejecutivo_comercial || "—"}
                </td>
                <td className="px-4 py-3 text-slate-600">{p.pais || "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {formatFecha(fechaFinal)}
                </td>
                <td className="px-4 py-3">
                  {dias === null ? (
                    "—"
                  ) : (
                    <span
                      className={
                        dias < 0
                          ? "font-medium text-rust-500"
                          : dias <= 7
                          ? "font-medium text-clay-500"
                          : "text-slate-600"
                      }
                    >
                      {dias} d
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, p.porcentaje_avance ?? 0)
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">
                      {p.porcentaje_avance ?? 0}%
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
