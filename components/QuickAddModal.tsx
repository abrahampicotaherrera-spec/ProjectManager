"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Proyecto } from "@/lib/types";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15";

export default function QuickAddModal({
  proyectos,
  onClose,
}: {
  proyectos: Proyecto[];
  onClose: () => void;
}) {
  const [proyectoId, setProyectoId] = useState("");
  const [tipo, setTipo] = useState<"hito" | "reunion">("hito");
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [nota, setNota] = useState("");
  const [asunto, setAsunto] = useState("");
  const [asistentes, setAsistentes] = useState("");
  const [notasReunion, setNotasReunion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  const proyectosOrdenados = [...proyectos].sort((a, b) => b.numero - a.numero);

  async function guardar() {
    if (!proyectoId) {
      setError("Selecciona un proyecto.");
      return;
    }
    if (tipo === "hito" && !nota.trim()) {
      setError("Escribe el hito.");
      return;
    }
    if (tipo === "reunion" && !notasReunion.trim()) {
      setError("Escribe al menos las notas de la reunión.");
      return;
    }
    setError(null);
    setGuardando(true);

    const { error } =
      tipo === "hito"
        ? await supabase
            .from("hitos")
            .insert({ proyecto_id: proyectoId, fecha, nota: nota.trim() })
        : await supabase.from("reuniones").insert({
            proyecto_id: proyectoId,
            fecha,
            asunto: asunto.trim() || null,
            asistentes: asistentes.trim() || null,
            notas: notasReunion.trim(),
          });
    setGuardando(false);
    if (error) {
      setError(error.message);
      return;
    }

    setNota("");
    setAsunto("");
    setAsistentes("");
    setNotasReunion("");
    setExito(true);
    setTimeout(() => setExito(false), 2500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 px-4 backdrop-blur-[2px]">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">
            Agregar hito o nota de reunión
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-ink-900"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Proyecto</span>
            <select
              className={`${inputCls} mt-1`}
              value={proyectoId}
              onChange={(e) => setProyectoId(e.target.value)}
            >
              <option value="">Selecciona un proyecto…</option>
              {proyectosOrdenados.map((p) => (
                <option key={p.id} value={p.id}>
                  No. {p.numero} — {p.cliente}
                </option>
              ))}
            </select>
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => setTipo("hito")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                tipo === "hito"
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Hito
            </button>
            <button
              onClick={() => setTipo("reunion")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                tipo === "reunion"
                  ? "border-brand-400 bg-brand-50 text-brand-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              Reunión
            </button>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-slate-500">Fecha</span>
            <input
              type="date"
              className={`${inputCls} mt-1`}
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
            />
          </label>

          {tipo === "hito" ? (
            <label className="block">
              <span className="text-xs font-medium text-slate-500">Hito</span>
              <textarea
                className={`${inputCls} mt-1 min-h-[80px]`}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Describe el hito…"
              />
            </label>
          ) : (
            <>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Asunto</span>
                <input
                  className={`${inputCls} mt-1`}
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  placeholder="Ej. Kick off, revisión de avance…"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">
                  Asistentes
                </span>
                <input
                  className={`${inputCls} mt-1`}
                  value={asistentes}
                  onChange={(e) => setAsistentes(e.target.value)}
                  placeholder="Nombres separados por coma"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500">Notas</span>
                <textarea
                  className={`${inputCls} mt-1 min-h-[90px]`}
                  value={notasReunion}
                  onChange={(e) => setNotasReunion(e.target.value)}
                  placeholder="¿Qué se habló, qué se acordó, próximos pasos…?"
                />
              </label>
            </>
          )}

          {error && <p className="text-xs text-rust-500">{error}</p>}
          {exito && (
            <p className="text-xs font-medium text-brand-600">
              Guardado ✓ — puedes agregar otro.
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-ink-800 hover:bg-slate-50"
          >
            Cerrar
          </button>
          <button
            onClick={guardar}
            disabled={guardando}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
