"use client";

import { useEffect, useState } from "react";
import {
  CONECTIVIDADES,
  ESTADOS,
  PRIORIDADES,
  Proyecto,
  ProyectoInput,
  TIPOS_TAREA,
} from "@/lib/types";
import {
  calcularDiasDisponibles,
  calcularFechaProyectadaFinal,
  calcularRuta,
  formatFecha,
} from "@/lib/calculations";
import PipelineStepper from "./PipelineStepper";

const vacio = (numero: number): ProyectoInput => ({
  numero,
  tipo_tarea: "PROYECTO",
  cliente: "",
  nombre_hubspot: "",
  nv: "",
  ruc: "",
  dv: "",
  estado: "Inicio",
  tarea: "",
  observaciones: "",
  asignado: "",
  ejecutivo_comercial: "",
  pais: "",
  prioridad: "Medio",
  semanas_proyecto: null,
  fecha_asignacion: null,
  fecha_inicio: null,
  fecha_finalizacion: null,
  proyecto_con_gantt: false,
  ruta_gantt: "",
  porcentaje_avance: 0,
  ruta_hubspot: "",
  codigo_cliente_xdoc: "",
  conectividad: null,
});

function Campo({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
      {helper && <p className="mt-1 text-[11px] text-slate-400">{helper}</p>}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15";

export default function ProjectForm({
  proyecto,
  siguienteNumero,
  carpetaBase,
  asignados,
  ejecutivos,
  onCancel,
  onSave,
  onDelete,
}: {
  proyecto: Proyecto | null;
  siguienteNumero: number;
  carpetaBase: string;
  asignados: string[];
  ejecutivos: string[];
  onCancel: () => void;
  onSave: (data: ProyectoInput, id: string | null) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState<ProyectoInput>(
    proyecto
      ? {
          numero: proyecto.numero,
          tipo_tarea: proyecto.tipo_tarea,
          cliente: proyecto.cliente,
          nombre_hubspot: proyecto.nombre_hubspot,
          nv: proyecto.nv,
          ruc: proyecto.ruc,
          dv: proyecto.dv,
          estado: proyecto.estado,
          tarea: proyecto.tarea,
          observaciones: proyecto.observaciones,
          asignado: proyecto.asignado,
          ejecutivo_comercial: proyecto.ejecutivo_comercial,
          pais: proyecto.pais,
          prioridad: proyecto.prioridad,
          semanas_proyecto: proyecto.semanas_proyecto,
          fecha_asignacion: proyecto.fecha_asignacion,
          fecha_inicio: proyecto.fecha_inicio,
          fecha_finalizacion: proyecto.fecha_finalizacion,
          proyecto_con_gantt: proyecto.proyecto_con_gantt,
          ruta_gantt: proyecto.ruta_gantt,
          porcentaje_avance: proyecto.porcentaje_avance,
          ruta_hubspot: proyecto.ruta_hubspot,
          codigo_cliente_xdoc: proyecto.codigo_cliente_xdoc,
          conectividad: proyecto.conectividad,
        }
      : vacio(siguienteNumero)
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onCancel]);

  const set = <K extends keyof ProyectoInput>(k: K, v: ProyectoInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const fechaProyectadaFinal = calcularFechaProyectadaFinal(
    form.fecha_inicio,
    form.semanas_proyecto
  );
  const diasDisponibles = calcularDiasDisponibles(fechaProyectadaFinal);
  const ruta = calcularRuta(carpetaBase, form.numero, form.cliente || "SIN-CLIENTE");

  async function guardar() {
    if (!form.cliente.trim()) {
      setError("El campo Cliente es obligatorio.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await onSave(form, proyecto?.id ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-950/40 backdrop-blur-[2px]">
      <div className="flex h-full w-full max-w-2xl flex-col bg-slate-50 shadow-2xl">
        {/* Encabezado */}
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <label className="block">
                <span className="text-[10px] font-medium text-slate-400">
                  No.
                </span>
                <input
                  type="number"
                  className="mt-0.5 w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
                  value={form.numero}
                  onChange={(e) => set("numero", Number(e.target.value))}
                />
              </label>
              <div>
                <h2 className="text-lg font-semibold text-ink-900">
                  {form.cliente || "Sin nombre de cliente"}
                </h2>
                <p className="text-[11px] text-slate-400">
                  El siguiente proyecto nuevo continuará desde el número más
                  alto que exista.
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-ink-900"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <div className="mt-4">
            <PipelineStepper estado={form.estado} />
          </div>
        </div>

        {/* Cuerpo con scroll */}
        <div className="thin-scroll flex-1 space-y-8 overflow-y-auto px-6 py-6">
          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Identificación
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Tipo de tarea">
                <select
                  className={inputCls}
                  value={form.tipo_tarea}
                  onChange={(e) => set("tipo_tarea", e.target.value as any)}
                >
                  {TIPOS_TAREA.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Cliente" helper="Nombre del cliente">
                <input
                  className={inputCls}
                  value={form.cliente}
                  onChange={(e) => set("cliente", e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </Campo>
              <Campo label="Nombre HubSpot" helper="Como aparece en HubSpot">
                <input
                  className={inputCls}
                  value={form.nombre_hubspot ?? ""}
                  onChange={(e) => set("nombre_hubspot", e.target.value)}
                />
              </Campo>
              <Campo label="NV" helper="Número de trabajo del requerimiento">
                <input
                  className={`${inputCls} font-mono`}
                  value={form.nv ?? ""}
                  onChange={(e) => set("nv", e.target.value)}
                />
              </Campo>
              <Campo label="RUC" helper="ID Tax del cliente">
                <input
                  className={`${inputCls} font-mono`}
                  value={form.ruc ?? ""}
                  onChange={(e) => set("ruc", e.target.value)}
                />
              </Campo>
              <Campo label="DV" helper="Dígito verificador (clientes de Panamá)">
                <input
                  className={`${inputCls} font-mono`}
                  value={form.dv ?? ""}
                  onChange={(e) => set("dv", e.target.value)}
                />
              </Campo>
              <Campo label="País">
                <input
                  className={inputCls}
                  value={form.pais ?? ""}
                  onChange={(e) => set("pais", e.target.value)}
                />
              </Campo>
              <Campo label="Código de cliente XDOC">
                <input
                  className={`${inputCls} font-mono`}
                  value={form.codigo_cliente_xdoc ?? ""}
                  onChange={(e) => set("codigo_cliente_xdoc", e.target.value)}
                />
              </Campo>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Estado y asignación
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Estado">
                <select
                  className={inputCls}
                  value={form.estado}
                  onChange={(e) => set("estado", e.target.value as any)}
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Prioridad">
                <select
                  className={inputCls}
                  value={form.prioridad}
                  onChange={(e) => set("prioridad", e.target.value as any)}
                >
                  {PRIORIDADES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Campo>
              <Campo label="Asignado" helper="Escribe para crear uno nuevo">
                <input
                  className={inputCls}
                  list="lista-asignados"
                  value={form.asignado ?? ""}
                  onChange={(e) => set("asignado", e.target.value)}
                />
                <datalist id="lista-asignados">
                  {asignados.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </Campo>
              <Campo
                label="Ejecutivo comercial"
                helper="Escribe para crear uno nuevo"
              >
                <input
                  className={inputCls}
                  list="lista-ejecutivos"
                  value={form.ejecutivo_comercial ?? ""}
                  onChange={(e) => set("ejecutivo_comercial", e.target.value)}
                />
                <datalist id="lista-ejecutivos">
                  {ejecutivos.map((a) => (
                    <option key={a} value={a} />
                  ))}
                </datalist>
              </Campo>
            </div>
            <Campo label="Tarea" helper="Actividades de la propuesta comercial">
              <textarea
                className={`${inputCls} min-h-[70px]`}
                value={form.tarea ?? ""}
                onChange={(e) => set("tarea", e.target.value)}
              />
            </Campo>
            <Campo label="Observaciones">
              <textarea
                className={`${inputCls} min-h-[70px]`}
                value={form.observaciones ?? ""}
                onChange={(e) => set("observaciones", e.target.value)}
              />
            </Campo>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Fechas y avance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Fecha asignación">
                <input
                  type="date"
                  className={inputCls}
                  value={form.fecha_asignacion ?? ""}
                  onChange={(e) => set("fecha_asignacion", e.target.value || null)}
                />
              </Campo>
              <Campo label="Fecha inicio" helper="Primer contacto con el cliente">
                <input
                  type="date"
                  className={inputCls}
                  value={form.fecha_inicio ?? ""}
                  onChange={(e) => set("fecha_inicio", e.target.value || null)}
                />
              </Campo>
              <Campo label="Semanas de proyecto">
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  className={inputCls}
                  value={form.semanas_proyecto ?? ""}
                  onChange={(e) =>
                    set(
                      "semanas_proyecto",
                      e.target.value === "" ? null : Number(e.target.value)
                    )
                  }
                />
              </Campo>
              <Campo
                label="Fecha finalización"
                helper="Fecha en que el cliente comenta que quiere salir en producción"
              >
                <input
                  type="date"
                  className={inputCls}
                  value={form.fecha_finalizacion ?? ""}
                  onChange={(e) =>
                    set("fecha_finalizacion", e.target.value || null)
                  }
                />
              </Campo>
              <Campo label="% Avance">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className={inputCls}
                  value={form.porcentaje_avance ?? 0}
                  onChange={(e) =>
                    set("porcentaje_avance", Number(e.target.value))
                  }
                />
              </Campo>
              <Campo label="Conectividad">
                <select
                  className={inputCls}
                  value={form.conectividad ?? ""}
                  onChange={(e) =>
                    set("conectividad", (e.target.value || null) as any)
                  }
                >
                  <option value="">Sin definir</option>
                  {CONECTIVIDADES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Campo>
            </div>

            {/* Campos calculados: solo lectura */}
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-4">
              <div>
                <p className="text-xs font-medium text-brand-700">
                  Fecha proyectada final
                </p>
                <p className="mt-1 text-sm text-ink-900">
                  {formatFecha(fechaProyectadaFinal)}
                </p>
                <p className="text-[11px] text-slate-400">
                  Calculado: fecha inicio + semanas × 7
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-brand-700">
                  Días disponibles
                </p>
                <p
                  className={`mt-1 text-sm font-medium ${
                    diasDisponibles !== null && diasDisponibles < 0
                      ? "text-rust-500"
                      : "text-ink-900"
                  }`}
                >
                  {diasDisponibles === null ? "—" : `${diasDisponibles} días`}
                </p>
                <p className="text-[11px] text-slate-400">
                  Fecha proyectada final − hoy
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              Rutas y Gantt
            </h3>
            <div>
              <p className="text-xs font-medium text-slate-500">Ruta</p>
              <p className="mt-1 break-all rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-600">
                {ruta}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Calculada como carpeta base + N°-CLIENTE. Configura la carpeta
                base en Configuración.
              </p>
            </div>
            <Campo label="Ruta HubSpot">
              <input
                className={inputCls}
                value={form.ruta_hubspot ?? ""}
                onChange={(e) => set("ruta_hubspot", e.target.value)}
                placeholder="https://app.hubspot.com/…"
              />
            </Campo>
            <div className="flex items-center gap-6">
              <span className="text-xs font-medium text-slate-500">
                Proyecto con GANTT
              </span>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  checked={form.proyecto_con_gantt === true}
                  onChange={() => set("proyecto_con_gantt", true)}
                />
                Sí
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  checked={form.proyecto_con_gantt === false}
                  onChange={() => set("proyecto_con_gantt", false)}
                />
                No
              </label>
            </div>
            {form.proyecto_con_gantt && (
              <Campo label="Ruta GANTT">
                <input
                  className={inputCls}
                  value={form.ruta_gantt ?? ""}
                  onChange={(e) => set("ruta_gantt", e.target.value)}
                />
              </Campo>
            )}
          </section>

          {error && (
            <div className="rounded-lg border border-rust-500/30 bg-rust-500/10 px-3 py-2 text-sm text-rust-500">
              {error}
            </div>
          )}
        </div>

        {/* Pie con acciones */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4">
          {proyecto && onDelete ? (
            <button
              onClick={() => onDelete(proyecto.id)}
              className="text-sm font-medium text-rust-500 hover:text-rust-500/80"
            >
              Eliminar proyecto
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={guardar}
              disabled={guardando}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              {guardando ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
