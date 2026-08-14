"use client";

import { useEffect, useRef, useState } from "react";

export default function ComboBox({
  value,
  onChange,
  opciones,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  opciones: string[];
  placeholder?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setTexto(value), [value]);

  useEffect(() => {
    function onClickFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", onClickFuera);
    return () => document.removeEventListener("mousedown", onClickFuera);
  }, []);

  const filtradas = opciones.filter((o) =>
    o.toLowerCase().includes(texto.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <input
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
        value={texto}
        placeholder={placeholder}
        onChange={(e) => {
          setTexto(e.target.value);
          onChange(e.target.value);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
      />
      {abierto && filtradas.length > 0 && (
        <ul className="thin-scroll absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {filtradas.map((o) => (
            <li key={o}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setTexto(o);
                  onChange(o);
                  setAbierto(false);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm text-ink-800 hover:bg-brand-50"
              >
                {o}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
