"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Hito } from "@/lib/types";
import { formatFecha } from "@/lib/calculations";
import AiNoteButtons from "./AiNoteButtons";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15";

export default function HitosPanel({ proyectoId }: { proyectoId: string }) {
  const [hitos, setHitos] = useState<Hito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [fechaEdit, setFechaEdit] = useState("");
  const [notaEdit, setNotaEdit] = useState("");
  const [guardandoEdit, setGuardandoEdit] = useState(false);

  async function cargarHitos() {
    setCargando(true);
    const { data, error } = await supabase
      .from("hitos")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error) setHitos(data ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarHitos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]);

  async function agregarHito() {
    if (!nota.trim()) return;
    setError(null);
    setGuardando(true);
    const { error } = await supabase
      .from("hitos")
      .insert({ proyecto_id: proyectoId, fecha, nota: nota.trim() });
    setGuardando(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNota("");
    await cargarHitos();
  }

  function empezarEdicion(h: Hito) {
    setEditandoId(h.id);
    setFechaEdit(h.fecha);
    setNotaEdit(h.nota);
  }

  function cancelarEdicion() {
    setEditandoId(null);
  }

  async function guardarEdicion(id: string) {
    if (!notaEdit.trim()) return;
    setGuardandoEdit(true);
    const { error } = await supabase
      .from("hitos")
      .update({ fecha: fechaEdit, nota: notaEdit.trim() })
      .eq("id", id);
    setGuardandoEdit(false);
    if (!error) {
      setEditandoId(null);
      await cargarHitos();
    }
  }

  async function eliminarHito(id: string) {
    const { error } = await supabase.from("hitos").delete().eq("id", id);
    if (!error) await cargarHitos();
  }

  return (
    <section className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        Hitos
      </h3>

      <div className="flex gap-2">
        <input
          type="date"
          className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
        />
        <input
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
          placeholder="Describe el hito…"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregarHito();
            }
          }}
        />
        <button
          onClick={agregarHito}
          disabled={guardando || !nota.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
        >
          Añadir
        </button>
      </div>
      {error && <p className="text-xs text-rust-500">{error}</p>}

      {cargando ? (
        <p className="text-xs text-slate-400">Cargando hitos…</p>
      ) : hitos.length === 0 ? (
        <p className="text-xs text-slate-400">
          Todavía no hay hitos registrados para este proyecto.
        </p>
      ) : (
        <ol className="space-y-3 border-l-2 border-brand-200 pl-4">
          {hitos.map((h) => {
            const editando = editandoId === h.id;
            return (
              <li key={h.id} className="group relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                {editando ? (
                  <div className="space-y-2 rounded-lg border border-brand-200 bg-brand-50/40 p-2">
                    <input
                      type="date"
                      className={`${inputCls}`}
                      value={fechaEdit}
                      onChange={(e) => setFechaEdit(e.target.value)}
                    />
                    <textarea
                      className={`${inputCls} min-h-[60px]`}
                      value={notaEdit}
                      onChange={(e) => setNotaEdit(e.target.value)}
                    />
                    <AiNoteButtons
                      texto={notaEdit}
                      onResultado={setNotaEdit}
                      permitirResumen={false}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelarEdicion}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-slate-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => guardarEdicion(h.id)}
                        disabled={guardandoEdit}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                      >
                        {guardandoEdit ? "Guardando…" : "Guardar"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-medium text-brand-700">
                        {formatFecha(h.fecha)}
                      </p>
                      <p className="text-sm text-ink-800">{h.nota}</p>
                    </div>
                    <div className="flex shrink-0 gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => empezarEdicion(h)}
                        className="text-[11px] text-slate-400 hover:text-brand-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminarHito(h.id)}
                        className="text-[11px] text-slate-300 hover:text-rust-500"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
