"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Reunion } from "@/lib/types";
import { formatFecha } from "@/lib/calculations";

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15";

function construirMailto(r: Reunion, cliente: string): string {
  const asunto = `Notas de reunión — ${cliente}${r.asunto ? " — " + r.asunto : ""}`;
  const lineas = [
    `Fecha: ${formatFecha(r.fecha)}`,
    r.asunto ? `Asunto: ${r.asunto}` : null,
    r.asistentes ? `Asistentes: ${r.asistentes}` : null,
    "",
    "Notas:",
    r.notas,
  ].filter((l): l is string => l !== null);
  const cuerpo = lineas.join("\n");
  return `mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(
    cuerpo
  )}`;
}

interface FormReunion {
  fecha: string;
  asunto: string;
  asistentes: string;
  notas: string;
}

function CamposReunion({
  valores,
  onChange,
}: {
  valores: FormReunion;
  onChange: (v: FormReunion) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-xs font-medium text-slate-500">Fecha</span>
          <input
            type="date"
            className={`${inputCls} mt-1`}
            value={valores.fecha}
            onChange={(e) => onChange({ ...valores, fecha: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-500">Asunto</span>
          <input
            className={`${inputCls} mt-1`}
            placeholder="Ej. Kick off, revisión de avance…"
            value={valores.asunto}
            onChange={(e) => onChange({ ...valores, asunto: e.target.value })}
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-medium text-slate-500">Asistentes</span>
        <input
          className={`${inputCls} mt-1`}
          placeholder="Nombres separados por coma"
          value={valores.asistentes}
          onChange={(e) => onChange({ ...valores, asistentes: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-slate-500">Notas</span>
        <textarea
          className={`${inputCls} mt-1 min-h-[90px]`}
          placeholder="¿Qué se habló, qué se acordó, próximos pasos…?"
          value={valores.notas}
          onChange={(e) => onChange({ ...valores, notas: e.target.value })}
        />
      </label>
    </>
  );
}

const vacio = (): FormReunion => ({
  fecha: new Date().toISOString().slice(0, 10),
  asunto: "",
  asistentes: "",
  notas: "",
});

export default function ReunionesPanel({
  proyectoId,
  cliente,
}: {
  proyectoId: string;
  cliente: string;
}) {
  const [reuniones, setReuniones] = useState<Reunion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  const [nueva, setNueva] = useState<FormReunion>(vacio());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [edicion, setEdicion] = useState<FormReunion>(vacio());
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  async function cargarReuniones() {
    setCargando(true);
    const { data, error } = await supabase
      .from("reuniones")
      .select("*")
      .eq("proyecto_id", proyectoId)
      .order("fecha", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error) setReuniones(data ?? []);
    setCargando(false);
  }

  useEffect(() => {
    cargarReuniones();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyectoId]);

  async function guardarReunion() {
    if (!nueva.notas.trim()) {
      setError("Escribe al menos las notas de la reunión.");
      return;
    }
    setError(null);
    setGuardando(true);
    const { error } = await supabase.from("reuniones").insert({
      proyecto_id: proyectoId,
      fecha: nueva.fecha,
      asunto: nueva.asunto.trim() || null,
      asistentes: nueva.asistentes.trim() || null,
      notas: nueva.notas.trim(),
    });
    setGuardando(false);
    if (error) {
      setError(error.message);
      return;
    }
    setNueva(vacio());
    setMostrarForm(false);
    await cargarReuniones();
  }

  function empezarEdicion(r: Reunion) {
    setEditandoId(r.id);
    setEdicion({
      fecha: r.fecha,
      asunto: r.asunto ?? "",
      asistentes: r.asistentes ?? "",
      notas: r.notas,
    });
  }

  async function guardarEdicion(id: string) {
    if (!edicion.notas.trim()) return;
    setGuardandoEdicion(true);
    const { error } = await supabase
      .from("reuniones")
      .update({
        fecha: edicion.fecha,
        asunto: edicion.asunto.trim() || null,
        asistentes: edicion.asistentes.trim() || null,
        notas: edicion.notas.trim(),
      })
      .eq("id", id);
    setGuardandoEdicion(false);
    if (!error) {
      setEditandoId(null);
      await cargarReuniones();
    }
  }

  async function eliminarReunion(id: string) {
    const { error } = await supabase.from("reuniones").delete().eq("id", id);
    if (!error) await cargarReuniones();
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Reuniones con el cliente
        </h3>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            + Nueva reunión
          </button>
        )}
      </div>

      {mostrarForm && (
        <div className="space-y-3 rounded-lg border border-brand-200 bg-brand-50/40 p-3">
          <CamposReunion valores={nueva} onChange={setNueva} />
          {error && <p className="text-xs text-rust-500">{error}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setMostrarForm(false);
                setError(null);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              onClick={guardarReunion}
              disabled={guardando}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar reunión"}
            </button>
          </div>
        </div>
      )}

      {cargando ? (
        <p className="text-xs text-slate-400">Cargando reuniones…</p>
      ) : reuniones.length === 0 ? (
        <p className="text-xs text-slate-400">
          Todavía no hay reuniones registradas para este proyecto.
        </p>
      ) : (
        <ul className="space-y-2">
          {reuniones.map((r) => {
            const abierta = expandidoId === r.id;
            const editando = editandoId === r.id;
            return (
              <li
                key={r.id}
                className="rounded-lg border border-slate-200 bg-white"
              >
                <button
                  onClick={() => setExpandidoId(abierta ? null : r.id)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-brand-700">
                      {formatFecha(r.fecha)}
                      {r.asunto ? ` · ${r.asunto}` : ""}
                    </p>
                    {!abierta && (
                      <p className="truncate text-xs text-slate-400">
                        {r.notas}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-slate-400">
                    {abierta ? "▲" : "▼"}
                  </span>
                </button>
                {abierta && (
                  <div className="space-y-3 border-t border-slate-100 px-3 py-3">
                    {editando ? (
                      <>
                        <CamposReunion valores={edicion} onChange={setEdicion} />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditandoId(null)}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-800 hover:bg-slate-50"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => guardarEdicion(r.id)}
                            disabled={guardandoEdicion}
                            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                          >
                            {guardandoEdicion ? "Guardando…" : "Guardar cambios"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        {r.asistentes && (
                          <p className="text-xs text-slate-500">
                            <span className="font-medium text-slate-600">
                              Asistentes:
                            </span>{" "}
                            {r.asistentes}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap text-sm text-ink-800">
                          {r.notas}
                        </p>
                        <div className="flex items-center gap-3">
                          <a
                            href={construirMailto(r, cliente)}
                            className="text-[11px] font-medium text-brand-700 hover:underline"
                          >
                            Enviar por correo
                          </a>
                          <button
                            onClick={() => empezarEdicion(r)}
                            className="text-[11px] font-medium text-slate-400 hover:text-brand-700"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarReunion(r.id)}
                            className="text-[11px] text-rust-500 hover:underline"
                          >
                            Eliminar reunión
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
