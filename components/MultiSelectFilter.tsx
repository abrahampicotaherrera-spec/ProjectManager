"use client";

import { useEffect, useRef, useState } from "react";

export default function MultiSelectFilter({
  label,
  opciones,
  seleccionadas,
  onChange,
}: {
  label: string;
  opciones: string[];
  seleccionadas: string[];
  onChange: (v: string[]) => void;
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

  function alternar(o: string) {
    if (seleccionadas.includes(o)) {
      onChange(seleccionadas.filter((x) => x !== o));
    } else {
      onChange([...seleccionadas, o]);
    }
  }

  const etiqueta =
    seleccionadas.length === 0 ? label : `${label} (${seleccionadas.length})`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto((v) => !v)}
        className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm shadow-sm hover:bg-slate-50 ${
          seleccionadas.length > 0
            ? "border-brand-300 bg-brand-50 text-brand-700"
            : "border-slate-200 bg-white text-ink-800"
        }`}
      >
        {etiqueta}
      </button>
      {abierto && (
        <div className="thin-scroll absolute z-20 mt-1 max-h-64 w-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {seleccionadas.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="mb-1 block px-2 text-[11px] font-medium text-brand-700 hover:underline"
            >
              Limpiar selección
            </button>
          )}
          <ul className="space-y-0.5">
            {opciones.map((o) => (
              <li key={o}>
                <label className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={seleccionadas.includes(o)}
                    onChange={() => alternar(o)}
                  />
                  {o}
                </label>
              </li>
            ))}
            {opciones.length === 0 && (
              <li className="px-2 py-1.5 text-xs text-slate-400">
                Sin opciones todavía.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
