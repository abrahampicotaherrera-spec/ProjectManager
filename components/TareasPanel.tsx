"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tarea } from "@/lib/types";
import { formatFecha } from "@/lib/calculations";

export default function TareasPanel({ proyectoId }: { proyectoId: string }) {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mostrarCompletadas, setMostrarCompletadas] = useState(false);

  async function cargarTareas() {
    setCargando(true);
    const { data, error } = await supabase
      .from("tareas")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("importante", { ascending: false })
      .order("fecha_limite", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    if (!error) setTareas(data ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarTareas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]);

  async function agregarTarea() {
    if (!texto.trim()) return;
    setGuardando(true);
    const { error } = await supabase.from("tareas").insert({
      proyecto_id: proyectoId,
      texto: texto.trim(),
      fecha_limite: fechaLimite || null,
    });
    setGuardando(false);
    if (!error) {
      setTexto("");
      setFechaLimite("");
      await cargarTareas();
    }
  }

  async function alternarCompletada(t: Tarea) {
    const completada = !t.completada;
    const { error } = await supabase
      .from("tareas")
      .update({
        completada,
        completada_en: completada ? new Date().toISOString() : null,
      })
      .eq("id", t.id);
    if (!error) await cargarTareas();
  }

  async function alternarImportante(t: Tarea) {
    const { error } = await supabase
      .from("tareas")
      .update({ importante: !t.importante })
      .eq("id", t.id);
    if (!error) await cargarTareas();
  }

  async function eliminarTarea(id: string) {
    const { error } = await supabase.from("tareas").delete().eq("id", id);
    if (!error) await cargarTareas();
  }

  const pendientes = tareas.filter((t) => !t.completada);
  const completadas = tareas.filter((t) => t.completada);

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        Lista de tareas
      </h3>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
          placeholder="Agregar una tarea…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregarTarea();
            }
          }}
        />
        <input
          type="date"
          className="w-40 rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
          title="Fecha límite (opcional)"
        />
        <button
          onClick={agregarTarea}
          disabled={guardando || !texto.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
        >
          Añadir
        </button>
      </div>

      {cargando ? (
        <p className="text-xs text-slate-400">Cargando tareas…</p>
      ) : (
        <>
          {pendientes.length === 0 ? (
            <p className="text-xs text-slate-400">No hay tareas pendientes.</p>
          ) : (
            <ul className="space-y-1">
              {pendientes.map((t) => (
                <FilaTarea
                  key={t.id}
                  tarea={t}
                  onToggle={() => alternarCompletada(t)}
                  onImportante={() => alternarImportante(t)}
                  onEliminar={() => eliminarTarea(t.id)}
                />
              ))}
            </ul>
          )}

          {completadas.length > 0 && (
            <div>
              <button
                onClick={() => setMostrarCompletadas((v) => !v)}
                className="text-xs font-medium text-slate-400 hover:text-brand-700"
              >
                {mostrarCompletadas ? "▲" : "▼"} Completadas (
                {completadas.length})
              </button>
              {mostrarCompletadas && (
                <ul className="mt-1 space-y-1">
                  {completadas.map((t) => (
                    <FilaTarea
                      key={t.id}
                      tarea={t}
                      onToggle={() => alternarCompletada(t)}
                      onImportante={() => alternarImportante(t)}
                      onEliminar={() => eliminarTarea(t.id)}
                    />
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

function FilaTarea({
  tarea,
  onToggle,
  onImportante,
  onEliminar,
}: {
  tarea: Tarea;
  onToggle: () => void;
  onImportante: () => void;
  onEliminar: () => void;
}) {
  const vencida =
    !tarea.completada &&
    !!tarea.fecha_limite &&
    new Date(tarea.fecha_limite + "T00:00:00").getTime() <
      new Date().setHours(0, 0, 0, 0);

  return (
    <li className="group flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2 hover:border-slate-200">
      <input
        type="checkbox"
        checked={tarea.completada}
        onChange={onToggle}
        className="h-4 w-4 shrink-0 accent-brand-600"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm ${
            tarea.completada ? "text-slate-400 line-through" : "text-ink-800"
          }`}
        >
          {tarea.texto}
        </p>
        {tarea.fecha_limite && (
          <p
            className={`text-[11px] ${
              vencida ? "font-medium text-rust-500" : "text-slate-400"
            }`}
          >
            Vence: {formatFecha(tarea.fecha_limite)}
          </p>
        )}
      </div>
      <button
        onClick={onImportante}
        title="Marcar como importante"
        className={`shrink-0 text-sm ${
          tarea.importante
            ? "text-clay-500"
            : "text-slate-300 opacity-0 group-hover:opacity-100"
        }`}
      >
        {tarea.importante ? "★" : "☆"}
      </button>
      <button
        onClick={onEliminar}
        className="shrink-0 text-[11px] text-slate-300 opacity-0 hover:text-rust-500 group-hover:opacity-100"
      >
        Quitar
      </button>
    </li>
  );
}
