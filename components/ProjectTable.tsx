"use client";

import { useState } from "react";
import { Proyecto } from "@/lib/types";
import { COLUMNAS_PROYECTO } from "@/lib/columnas";
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

function celdaSimple(texto: string | number | null | undefined, mono = false) {
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

function celdaTruncada(texto: string | null | undefined) {
  return (
    <td
      className="max-w-[240px] truncate border-b border-r border-slate-200 px-2.5 py-1.5 text-[13px] text-ink-800"
      title={texto ?? ""}
    >
      {texto || <span className="text-slate-300">—</span>}
    </td>
  );
}

export default function ProjectTable({
  proyectos,
  onSelect,
  carpetaBase,
  columnasVisibles,
  orden,
  onReordenar,
}: {
  proyectos: Proyecto[];
  onSelect: (p: Proyecto) => void;
  carpetaBase: string;
  columnasVisibles: Record<string, boolean>;
  orden: string[];
  onReordenar: (nuevoOrden: string[]) => void;
}) {
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  function onDragStart(key: string) {
    setArrastrando(key);
  }

  function onDragOver(e: React.DragEvent, key: string) {
    e.preventDefault();
    if (!arrastrando || arrastrando === key) return;
  }

  function onDrop(keyDestino: string) {
    if (!arrastrando || arrastrando === keyDestino) {
      setArrastrando(null);
      return;
    }
    const nuevo = [...orden];
    const desde = nuevo.indexOf(arrastrando);
    const hasta = nuevo.indexOf(keyDestino);
    if (desde === -1 || hasta === -1) {
      setArrastrando(null);
      return;
    }
    nuevo.splice(desde, 1);
    nuevo.splice(hasta, 0, arrastrando);
    onReordenar(nuevo);
    setArrastrando(null);
  }

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

  const columnas = orden
    .map((key) => COLUMNAS_PROYECTO.find((c) => c.key === key))
    .filter((c): c is (typeof COLUMNAS_PROYECTO)[number] => !!c)
    .filter((c) => columnasVisibles[c.key] ?? true);

  function celdaPorColumna(
    p: Proyecto,
    key: string,
    extras: { fechaFinal: string | null; dias: number | null; ruta: string; avance: number | null }
  ) {
    switch (key) {
      case "numero":
        return celdaSimple(p.numero, true);
      case "tipo_tarea":
        return celdaSimple(p.tipo_tarea);
      case "cliente":
        return (
          <td className="whitespace-nowrap border-b border-r border-slate-200 px-2.5 py-1.5 text-[13px] font-medium text-ink-900">
            {p.cliente}
          </td>
        );
      case "nombre_hubspot":
        return celdaSimple(p.nombre_hubspot);
      case "nv":
        return celdaSimple(p.nv, true);
      case "ruc":
        return celdaSimple(p.ruc, true);
      case "dv":
        return celdaSimple(p.dv, true);
      case "estado":
        return celdaSimple(p.estado);
      case "tarea":
        return celdaTruncada(p.tarea);
      case "observaciones":
        return celdaTruncada(p.observaciones);
      case "asignado":
        return celdaSimple(p.asignado);
      case "ejecutivo_comercial":
        return celdaSimple(p.ejecutivo_comercial);
      case "pais":
        return celdaSimple(p.pais);
      case "prioridad":
        return celdaSimple(p.prioridad);
      case "semanas_proyecto":
        return celdaSimple(p.semanas_proyecto);
      case "fecha_asignacion":
        return celdaSimple(formatFecha(p.fecha_asignacion));
      case "fecha_inicio":
        return celdaSimple(formatFecha(p.fecha_inicio));
      case "fecha_proyectada_final":
        return celdaSimple(formatFecha(extras.fechaFinal));
      case "dias_disponibles":
        return celdaSimple(extras.dias === null ? null : `${extras.dias} d`);
      case "fecha_finalizacion":
        return celdaSimple(formatFecha(p.fecha_finalizacion));
      case "ruta":
        return (
          <td
            className="max-w-[220px] truncate border-b border-r border-slate-200 px-2.5 py-1.5 font-mono text-xs text-slate-500"
            title={extras.ruta}
          >
            {extras.ruta}
          </td>
        );
      case "porcentaje_avance":
        return celdaSimple(extras.avance === null ? null : `${extras.avance}%`);
      case "proyecto_con_gantt":
        return celdaSimple(p.proyecto_con_gantt ? "Sí" : "No");
      case "ruta_gantt":
        return celdaSimple(p.ruta_gantt);
      case "ruta_hubspot":
        return celdaSimple(p.ruta_hubspot);
      case "codigo_cliente_xdoc":
        return celdaSimple(p.codigo_cliente_xdoc, true);
      case "conectividad":
        return celdaSimple(p.conectividad);
      default:
        return <td className="border-b border-r border-slate-200 px-2.5 py-1.5" />;
    }
  }

  return (
    <div className="thin-scroll overflow-auto rounded-xl border border-slate-200 bg-white shadow-card">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {columnas.map((c) => (
              <th
                key={c.key}
                draggable
                onDragStart={() => onDragStart(c.key)}
                onDragOver={(e) => onDragOver(e, c.key)}
                onDrop={() => onDrop(c.key)}
                onDragEnd={() => setArrastrando(null)}
                title="Arrastra para reordenar"
                className={`sticky top-0 z-10 cursor-grab select-none whitespace-nowrap border-b border-r border-slate-300 bg-[#F9F9F9] px-2.5 py-2 text-left text-[11px] font-bold uppercase tracking-tight text-ink-900 active:cursor-grabbing ${
                  arrastrando === c.key ? "opacity-40" : ""
                }`}
              >
                {c.label}
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
            const ruta = `${carpetaBase.replace(/[\\/]+$/, "")}\\${p.numero}-${
              p.cliente || "SIN-CLIENTE"
            }`;
            const avance = p.proyecto_con_gantt
              ? p.porcentaje_avance
              : calcularAvanceAutomatico(p.fecha_inicio, fechaFinal, false) ??
                p.porcentaje_avance;
            const fondo = RESALTADO_FILA[p.estado];
            const extras = { fechaFinal, dias, ruta, avance };

            return (
              <tr
                key={p.id}
                onClick={() => onSelect(p)}
                className="cursor-pointer hover:brightness-95"
                style={fondo ? { backgroundColor: fondo } : undefined}
              >
                {columnas.map((c) => (
                  <ContentPasar key={c.key}>
                    {celdaPorColumna(p, c.key, extras)}
                  </ContentPasar>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Pequeño wrapper para poder usar key en la iteración sin envolver en un
// elemento extra que rompa la tabla (React exige key en el nodo raíz del map).
function ContentPasar({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
