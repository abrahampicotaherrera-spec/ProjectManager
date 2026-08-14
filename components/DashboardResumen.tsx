"use client";

import { ESTADOS_PIPELINE, Proyecto } from "@/lib/types";
import {
  calcularAvanceAutomatico,
  calcularDiasDisponibles,
  calcularFechaProyectadaFinal,
} from "@/lib/calculations";
import EstadoPill from "./EstadoPill";

export default function DashboardResumen({
  proyectos,
  onSelect,
}: {
  proyectos: Proyecto[];
  onSelect: (p: Proyecto) => void;
}) {
  const activos = proyectos.filter(
    (p) => p.estado !== "Cerrado" && p.estado !== "Suspendido"
  );

  const conteos = ESTADOS_PIPELINE.map((estado) => ({
    estado,
    cantidad: activos.filter((p) => p.estado === estado).length,
  }));

  const filas = activos
    .map((p) => {
      const fechaFinal = calcularFechaProyectadaFinal(
        p.fecha_inicio,
        p.semanas_proyecto
      );
      const dias = calcularDiasDisponibles(fechaFinal);
      const avance = p.proyecto_con_gantt
        ? p.porcentaje_avance
        : calcularAvanceAutomatico(p.fecha_inicio, fechaFinal, false) ??
          p.porcentaje_avance;
      return { p, dias, avance };
    })
    .sort((a, b) => {
      if (a.dias === null) return 1;
      if (b.dias === null) return -1;
      return a.dias - b.dias;
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {conteos.map((c) => (
          <div
            key={c.estado}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-card"
          >
            <p className="text-2xl font-semibold text-ink-900">{c.cantidad}</p>
            <p className="mt-1 text-xs leading-tight text-slate-500">
              {c.estado}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-900">
            Clientes activos ({activos.length})
          </h3>
          <p className="text-xs text-slate-400">
            Todo lo que no está Cerrado ni Suspendido, ordenado por urgencia
            (menos días disponibles primero).
          </p>
        </div>
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs uppercase tracking-tight text-slate-500">
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Prioridad</th>
                <th className="px-4 py-2 font-medium">Asignado</th>
                <th className="px-4 py-2 font-medium">% Avance</th>
                <th className="px-4 py-2 font-medium">Días disponibles</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ p, dias, avance }) => (
                <tr
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-brand-50/40"
                >
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-ink-900">
                    {p.cliente}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <EstadoPill estado={p.estado} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                    {p.prioridad}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                    {p.asignado || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                    {avance === null ? "—" : `${avance}%`}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-2 font-medium ${
                      dias !== null && dias < 0
                        ? "text-rust-500"
                        : "text-ink-800"
                    }`}
                  >
                    {dias === null ? "—" : `${dias} d`}
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    No hay proyectos activos en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
