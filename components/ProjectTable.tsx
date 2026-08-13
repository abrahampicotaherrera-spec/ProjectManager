"use client";

import { Proyecto } from "@/lib/types";
import {
  calcularAvanceAutomatico,
  calcularDiasDisponibles,
  calcularFechaProyectadaFinal,
  formatFecha,
} from "@/lib/calculations";

// Mismos colores que la hoja PROYECTOS de STATUS_DE_PROYECTOS.xlsm
// (Formato condicional por columna ESTADO)
const RESALTADO_FILA: Record<string, string> = {
  "Area Comercial": "#F6C6AD",
  Pruebas: "#FFD666",
  "Go Live / Hyper Care": "#B4E5A2",
  Suspendido: "#DDA6A6",
};

function celda(texto: string | number | null | undefined, mono = false) {
  return (
    <td
      className={`whitespace-nowrap border-b border-r border-slate-200 px-2.5 py-1.5 text-[13px] text-ink-800 ${
        mono ? "font-mono text-xs" : ""
      }`}
    >
      {texto === null || texto === undefined || texto === "" ? (
        <span className="text-slate-300">—</span>
      ) : (
        texto
      )}
    </td>
  );
}

const COLUMNAS = [
  "No.",
  "Tipo de tarea",
  "Cliente",
  "Nombre HubSpot",
  "NV",
  "RUC",
  "DV",
  "Estado",
  "Tarea",
  "Observaciones",
  "Asignado",
  "Ejecutivo comercial",
  "País",
  "Prioridad",
  "Semanas de proyecto",
  "Fecha asignación",
  "Fecha inicio",
  "Fecha proyectada final",
  "Cantidad de días disponibles",
  "Fecha finalización",
  "Ruta",
  "% Avance",
  "Proyecto con GANTT",
  "Ruta GANTT",
  "Ruta HubSpot",
  "Código cliente XDOC",
  "Conectividad",
];

export default function ProjectTable({
  proyectos,
  onSelect,
  carpetaBase,
}: {
  proyectos: Proyecto[];
  onSelect: (p: Proyecto) => void;
  carpetaBase: string;
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
    <div className="thin-scroll overflow-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {COLUMNAS.map((c) => (
              <th
                key={c}
                className="sticky top-0 z-10 whitespace-nowrap border-b border-r border-slate-300 bg-[#F9F9F9] px-2.5 py-2 text-left text-[11px] font-bold uppercase tracking-tight text-ink-900"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => {
            const fechaFinal = calcularFechaProyectadaFinal(
              p.fecha_inicio,
              p.semanas_proyecto
            );
            const dias = calcularDiasDisponibles(fechaFinal);
            const avanceMostrado = p.proyecto_con_gantt
              ? p.porcentaje_avance
              : calcularAvanceAutomatico(p.fecha_inicio, fechaFinal, false) ??
                p.porcentaje_avance;
            const ruta = `${carpetaBase.replace(/[\\/]+$/, "")}\\${p.numero}-${
              p.cliente || "SIN-CLIENTE"
            }`;
            const fondo = RESALTADO_FILA[p.estado];
            return (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                className="cursor-pointer hover:brightness-95"
                style={fondo ? { backgroundColor: fondo } : undefined}
              >
                {celda(p.numero, true)}
                {celda(p.tipo_tarea)}
                <td className="whitespace-nowrap border-b border-r border-slate-200 px-2.5 py-1.5 text-[13px] font-medium text-ink-900">
                  {p.cliente}
                </td>
                {celda(p.nombre_hubspot)}
                {celda(p.nv, true)}
                {celda(p.ruc, true)}
                {celda(p.dv, true)}
                {celda(p.estado)}
                <td
                  className="max-w-[240px] truncate border-b border-r border-slate-200 px-2.5 py-1.5 text-[13px] text-ink-800"
                  title={p.tarea ?? ""}
                >
                  {p.tarea || <span className="text-slate-300">—</span>}
                </td>
                <td
                  className="max-w-[240px] truncate border-b border-r border-slate-200 px-2.5 py-1.5 text-[13px] text-ink-800"
                  title={p.observaciones ?? ""}
                >
                  {p.observaciones || <span className="text-slate-300">—</span>}
                </td>
                {celda(p.asignado)}
                {celda(p.ejecutivo_comercial)}
                {celda(p.pais)}
                {celda(p.prioridad)}
                {celda(p.semanas_proyecto)}
                {celda(formatFecha(p.fecha_asignacion))}
                {celda(formatFecha(p.fecha_inicio))}
                {celda(formatFecha(fechaFinal))}
                {celda(dias === null ? null : `${dias} d`)}
                {celda(formatFecha(p.fecha_finalizacion))}
                <td
                  className="max-w-[220px] truncate border-b border-r border-slate-200 px-2.5 py-1.5 font-mono text-xs text-slate-500"
                  title={ruta}
                >
                  {ruta}
                </td>
                {celda(
                  avanceMostrado === null ? null : `${avanceMostrado}%`
                )}
                {celda(p.proyecto_con_gantt ? "Sí" : "No")}
                {celda(p.ruta_gantt)}
                {celda(p.ruta_hubspot)}
                {celda(p.codigo_cliente_xdoc, true)}
                {celda(p.conectividad)}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
