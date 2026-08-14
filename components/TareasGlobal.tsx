"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tarea } from "@/lib/types";
import { formatFecha } from "@/lib/calculations";

interface TareaConProyecto extends Tarea {
  proyectos: { id: string; numero: number; cliente: string } | null;
}

export default function TareasGlobal({
  onAbrirProyecto,
}: {
  onAbrirProyecto: (proyectoId: string) => void;
}) {
  const [tareas, setTareas] = useState<TareaConProyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [mostrarCompletadas, setMostrarCompletadas] = useState(false);

  async function cargar() {
    setCargando(true);
    const { data, error } = await supabase
      .from("tareas")
      .select("*, proyectos(id, numero, cliente)")
      .order("fecha_limite", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    if (!error) setTareas((data as unknown as TareaConProyecto[]) ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function alternarCompletada(t: Tarea) {
    const completada = !t.completada;
    const { error } = await supabase
      .from("tareas")
      .update({
        completada,
        completada_en: completada ? new Date().toISOString() : null,
      })
      .eq("id", t.id);
    if (!error) await cargar();
  }

  async function alternarImportante(t: Tarea) {
    const { error } = await supabase
      .from("tareas")
      .update({ importante: !t.importante })
      .eq("id", t.id);
    if (!error) await cargar();
  }

  async function actualizarFechaLimite(id: string, fecha: string) {
    const { error } = await supabase
      .from("tareas")
      .update({ fecha_limite: fecha || null })
      .eq("id", id);
    if (!error) await cargar();
  }

  async function eliminarTarea(id: string) {
    const { error } = await supabase.from("tareas").delete().eq("id", id);
    if (!error) {
      if (seleccionada === id) setSeleccionada(null);
      await cargar();
    }
  }

  if (cargando) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400 shadow-card">
        Cargando tareas…
      </div>
    );
  }

  const pendientes = tareas.filter((t) => !t.completada);
  const completadas = tareas.filter((t) => t.completada);
  const tareaSeleccionada = tareas.find((t) => t.id === seleccionada) ?? null;

  const grupos = new Map<string, TareaConProyecto[]>();
  pendientes.forEach((t) => {
    const clave = t.proyectos
      ? `No. ${t.proyectos.numero} · ${t.proyectos.cliente}`
      : "Sin proyecto";
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave)!.push(t);
  });

  return (
    <div className="flex items-start gap-4">
      <div className="flex-1 space-y-4">
        {pendientes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 py-16 text-center">
            <p className="text-sm font-medium text-ink-800">
              No hay tareas pendientes
            </p>
            <p className="mt-1 text-sm text-slate-500">¡Todo al día!</p>
          </div>
        ) : (
          Array.from(grupos.entries()).map(([clave, items]) => (
            <div
              key={clave}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card"
            >
              <div className="border-b border-slate-200 px-4 py-2.5">
                <h3 className="text-sm font-semibold text-ink-900">{clave}</h3>
              </div>
              <ul>
                {items.map((t) => {
                  const vencida =
                    !!t.fecha_limite &&
                    new Date(t.fecha_limite + "T00:00:00").getTime() <
                      new Date().setHours(0, 0, 0, 0);
                  return (
                    <li
                      key={t.id}
                      onClick={() => setSeleccionada(t.id)}
                      className={`flex cursor-pointer items-center gap-3 border-b border-slate-50 px-4 py-2.5 last:border-0 hover:bg-brand-50/40 ${
                        seleccionada === t.id ? "bg-brand-50/60" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={t.completada}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => alternarCompletada(t)}
                        className="h-4 w-4 shrink-0 accent-brand-600"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink-800">{t.texto}</p>
                        {t.fecha_limite && (
                          <p
                            className={`text-[11px] ${
                              vencida
                                ? "font-medium text-rust-500"
                                : "text-slate-400"
                            }`}
                          >
                            Vence: {formatFecha(t.fecha_limite)}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alternarImportante(t);
                        }}
                        className={`shrink-0 text-sm ${
                          t.importante ? "text-clay-500" : "text-slate-300"
                        }`}
                      >
                        {t.importante ? "★" : "☆"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}

        {completadas.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
            <button
              onClick={() => setMostrarCompletadas((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left"
            >
              <h3 className="text-sm font-semibold text-ink-900">
                Completadas ({completadas.length})
              </h3>
              <span className="text-slate-400">
                {mostrarCompletadas ? "▲" : "▼"}
              </span>
            </button>
            {mostrarCompletadas && (
              <ul>
                {completadas.map((t) => (
                  <li
                    key={t.id}
                    onClick={() => setSeleccionada(t.id)}
                    className="flex cursor-pointer items-center gap-3 border-t border-slate-50 px-4 py-2.5 hover:bg-brand-50/40"
                  >
                    <input
                      type="checkbox"
                      checked={t.completada}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => alternarCompletada(t)}
                      className="h-4 w-4 shrink-0 accent-brand-600"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-slate-400 line-through">
                        {t.texto}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {t.proyectos
                          ? `No. ${t.proyectos.numero} · ${t.proyectos.cliente}`
                          : "Sin proyecto"}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {tareaSeleccionada && (
        <div className="w-80 shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-card">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={tareaSeleccionada.completada}
                onChange={() => alternarCompletada(tareaSeleccionada)}
                className="mt-1 h-4 w-4 shrink-0 accent-brand-600"
              />
              <h3
                className={`text-sm font-semibold ${
                  tareaSeleccionada.completada
                    ? "text-slate-400 line-through"
                    : "text-ink-900"
                }`}
              >
                {tareaSeleccionada.texto}
              </h3>
            </div>
            <button
              onClick={() => setSeleccionada(null)}
              className="shrink-0 text-slate-400 hover:text-ink-900"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          {tareaSeleccionada.proyectos && (
            <button
              onClick={() => onAbrirProyecto(tareaSeleccionada.proyectos!.id)}
              className="mt-2 text-xs font-medium text-brand-700 hover:underline"
            >
              Ver proyecto: No. {tareaSeleccionada.proyectos.numero} ·{" "}
              {tareaSeleccionada.proyectos.cliente}
            </button>
          )}

          <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
            <button
              onClick={() => alternarImportante(tareaSeleccionada)}
              className={`flex items-center gap-2 text-sm ${
                tareaSeleccionada.importante
                  ? "text-clay-500"
                  : "text-slate-500 hover:text-clay-500"
              }`}
            >
              <span>{tareaSeleccionada.importante ? "★" : "☆"}</span>
              Marcar como importante
            </button>

            <label className="block text-sm text-slate-500">
              Fecha de vencimiento
              <input
                type="date"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
                value={tareaSeleccionada.fecha_limite ?? ""}
                onChange={(e) =>
                  actualizarFechaLimite(tareaSeleccionada.id, e.target.value)
                }
              />
            </label>
          </div>

          <button
            onClick={() => eliminarTarea(tareaSeleccionada.id)}
            className="mt-6 text-xs font-medium text-rust-500 hover:underline"
          >
            Eliminar tarea
          </button>

          <p className="mt-4 text-[11px] text-slate-400">
            Creada el {formatFecha(tareaSeleccionada.created_at.slice(0, 10))}
          </p>
        </div>
      )}
    </div>
  );
}
