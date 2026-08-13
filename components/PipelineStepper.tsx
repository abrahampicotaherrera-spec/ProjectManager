import { Estado, ESTADOS_PIPELINE, ESTADOS_EXCEPCION } from "@/lib/types";

export default function PipelineStepper({ estado }: { estado: Estado }) {
  const esExcepcion = (ESTADOS_EXCEPCION as readonly string[]).includes(estado);
  const idxActual = ESTADOS_PIPELINE.indexOf(
    estado as (typeof ESTADOS_PIPELINE)[number]
  );

  return (
    <div>
      <div className="flex items-center">
        {ESTADOS_PIPELINE.map((paso, i) => {
          const completado = !esExcepcion && i < idxActual;
          const activo = !esExcepcion && i === idxActual;
          return (
            <div key={paso} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-2.5 w-2.5 rounded-full border-2 transition-colors ${
                    completado
                      ? "bg-brand-500 border-brand-500"
                      : activo
                      ? "bg-white border-brand-500 ring-4 ring-brand-500/15"
                      : "bg-white border-slate-300"
                  }`}
                />
                <span
                  className={`text-[10px] leading-tight text-center w-16 ${
                    activo
                      ? "text-brand-700 font-semibold"
                      : completado
                      ? "text-ink-800"
                      : "text-slate-400"
                  }`}
                >
                  {paso}
                </span>
              </div>
              {i < ESTADOS_PIPELINE.length - 1 && (
                <div
                  className={`h-[2px] flex-1 -mt-4 ${
                    completado ? "bg-brand-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {esExcepcion && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-rust-500/25 bg-rust-500/10 px-2.5 py-1 text-xs font-medium text-rust-500">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          Proyecto {estado.toLowerCase()} — fuera del flujo normal
        </div>
      )}
    </div>
  );
}
