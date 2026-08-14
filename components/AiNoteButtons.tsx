"use client";

import { useState } from "react";

export default function AiNoteButtons({
  texto,
  onResultado,
  permitirResumen = true,
}: {
  texto: string;
  onResultado: (nuevoTexto: string) => void;
  permitirResumen?: boolean;
}) {
  const [cargando, setCargando] = useState<"mejorar" | "resumir" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ejecutar(modo: "mejorar" | "resumir") {
    if (!texto.trim()) return;
    setError(null);
    setCargando(modo);
    try {
      const resp = await fetch("/api/ia-notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, modo }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "No se pudo procesar con IA.");
      onResultado(data.resultado);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al conectar con la IA.");
    } finally {
      setCargando(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => ejecutar("mejorar")}
        disabled={!texto.trim() || cargando !== null}
        className="rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-50"
      >
        {cargando === "mejorar" ? "Mejorando…" : "✨ Mejorar redacción"}
      </button>
      {permitirResumen && (
        <button
          type="button"
          onClick={() => ejecutar("resumir")}
          disabled={!texto.trim() || cargando !== null}
          className="rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-50"
        >
          {cargando === "resumir" ? "Resumiendo…" : "📝 Resumir"}
        </button>
      )}
      {error && <span className="text-[11px] text-rust-500">{error}</span>}
    </div>
  );
}
