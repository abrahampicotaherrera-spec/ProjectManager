"use client";

import { useState } from "react";
import { Persona } from "@/lib/types";

export default function SettingsPanel({
  carpetaBase,
  asignados,
  ejecutivos,
  onClose,
  onGuardarCarpetaBase,
  onAgregarPersona,
  onEliminarPersona,
}: {
  carpetaBase: string;
  asignados: Persona[];
  ejecutivos: Persona[];
  onClose: () => void;
  onGuardarCarpetaBase: (v: string) => Promise<void>;
  onAgregarPersona: (
    nombre: string,
    rol: "ASIGNADO" | "EJECUTIVO_COMERCIAL"
  ) => Promise<void>;
  onEliminarPersona: (id: string) => Promise<void>;
}) {
  const [carpeta, setCarpeta] = useState(carpetaBase);
  const [nuevoAsignado, setNuevoAsignado] = useState("");
  const [nuevoEjecutivo, setNuevoEjecutivo] = useState("");
  const [guardando, setGuardando] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 px-4 backdrop-blur-[2px]">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Configuración</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-ink-900"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <label className="text-xs font-medium text-slate-500">
              Carpeta base local (para el campo RUTA)
            </label>
            <div className="mt-1 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs focus:border-brand-400 focus:outline-none"
                value={carpeta}
                onChange={(e) => setCarpeta(e.target.value)}
              />
              <button
                disabled={guardando}
                onClick={async () => {
                  setGuardando(true);
                  await onGuardarCarpetaBase(carpeta);
                  setGuardando(false);
                }}
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Guardar
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Ej: C:\Users\abraham.picota\OneDrive - Pagero AB\Proyectos
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              Lista de asignados
            </label>
            <ul className="mt-2 space-y-1">
              {asignados.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm"
                >
                  {p.nombre}
                  <button
                    onClick={() => onEliminarPersona(p.id)}
                    className="text-xs text-rust-500 hover:underline"
                  >
                    Quitar
                  </button>
                </li>
              ))}
              {asignados.length === 0 && (
                <li className="text-xs text-slate-400">Sin registros aún.</li>
              )}
            </ul>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Nombre"
                value={nuevoAsignado}
                onChange={(e) => setNuevoAsignado(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (!nuevoAsignado.trim()) return;
                  await onAgregarPersona(nuevoAsignado.trim(), "ASIGNADO");
                  setNuevoAsignado("");
                }}
                className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
              >
                Añadir
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500">
              Lista de ejecutivos comerciales
            </label>
            <ul className="mt-2 space-y-1">
              {ejecutivos.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm"
                >
                  {p.nombre}
                  <button
                    onClick={() => onEliminarPersona(p.id)}
                    className="text-xs text-rust-500 hover:underline"
                  >
                    Quitar
                  </button>
                </li>
              ))}
              {ejecutivos.length === 0 && (
                <li className="text-xs text-slate-400">Sin registros aún.</li>
              )}
            </ul>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
                placeholder="Nombre"
                value={nuevoEjecutivo}
                onChange={(e) => setNuevoEjecutivo(e.target.value)}
              />
              <button
                onClick={async () => {
                  if (!nuevoEjecutivo.trim()) return;
                  await onAgregarPersona(
                    nuevoEjecutivo.trim(),
                    "EJECUTIVO_COMERCIAL"
                  );
                  setNuevoEjecutivo("");
                }}
                className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-100"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
