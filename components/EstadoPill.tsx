import { Estado, ESTADOS_EXCEPCION } from "@/lib/types";

const COLORES: Record<string, string> = {
  "Area Comercial": "bg-slate-100 text-slate-600 border-slate-200",
  Inicio: "bg-brand-50 text-brand-700 border-brand-200",
  Integración: "bg-brand-100 text-brand-800 border-brand-200",
  Implementación: "bg-clay-400/15 text-clay-500 border-clay-400/30",
  Pruebas: "bg-clay-400/15 text-clay-500 border-clay-400/30",
  "Go Live / Hyper Care": "bg-brand-500/15 text-brand-700 border-brand-500/30",
  Cerrado: "bg-ink-900/5 text-ink-900 border-ink-900/15",
  Cancelado: "bg-rust-500/10 text-rust-500 border-rust-500/25",
  Suspendido: "bg-rust-400/10 text-rust-500 border-rust-400/25",
};

export default function EstadoPill({ estado }: { estado: Estado }) {
  const esExcepcion = (ESTADOS_EXCEPCION as readonly string[]).includes(estado);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${
        COLORES[estado] ?? "bg-slate-100 text-slate-600 border-slate-200"
      }`}
    >
      {esExcepcion && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {estado}
    </span>
  );
}
