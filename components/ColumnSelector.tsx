"use client";

import { useEffect, useRef, useState } from "react";
import { COLUMNAS_FIJAS, COLUMNAS_PROYECTO } from "@/lib/columnas";

export default function ColumnSelector({
  visibles,
  onChange,
}: {
  visibles: Record<string, boolean>;
  onChange: (v: Record<string, boolean>) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  const totalVisibles = Object.values(visibles).filter(Boolean).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-800 shadow-sm hover:bg-slate-50"
      >
        Columnas ({totalVisibles})
      </button>
      {abierto && (
        <div className="thin-scroll absolute right-0 z-20 mt-2 max-h-80 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="flex items-center justify-between px-2 py-1">
            <button
              onClick={() =>
                onChange(
                  Object.fromEntries(COLUMNAS_PROYECTO.map((c) => [c.key, true]))
                )
              }
              className="text-[11px] font-medium text-brand-700 hover:underline"
            >
              Mostrar todas
            </button>
            <button
              onClick={() =>
                onChange(
                  Object.fromEntries(
                    COLUMNAS_PROYECTO.map((c) => [
                      c.key,
                      COLUMNAS_FIJAS.includes(c.key),
                    ])
                  )
                )
              }
              className="text-[11px] font-medium text-slate-400 hover:underline"
            >
              Ocultar todas
            </button>
          </div>
          <ul className="mt-1 space-y-0.5">
            {COLUMNAS_PROYECTO.map((c) => {
              const fija = COLUMNAS_FIJAS.includes(c.key);
              return (
                <li key={c.key}>
                  <label
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 ${
                      fija ? "text-slate-400" : "text-ink-800"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={visibles[c.key] ?? true}
                      disabled={fija}
                      onChange={(e) =>
                        onChange({ ...visibles, [c.key]: e.target.checked })
                      }
                    />
                    {c.label}
                    {fija && (
                      <span className="ml-auto text-[10px] text-slate-300">
                        fija
                      </span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
