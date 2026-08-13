import { Proyecto } from "./types";

/**
 * FECHA PROYECTADA FINAL = fecha_inicio + semanas_proyecto * 7 días
 */
export function calcularFechaProyectadaFinal(
  fechaInicio: string | null,
  semanas: number | null
): string | null {
  if (!fechaInicio || !semanas) return null;
  const inicio = new Date(fechaInicio + "T00:00:00");
  if (isNaN(inicio.getTime())) return null;
  const final = new Date(inicio);
  final.setDate(final.getDate() + Math.round(semanas * 7));
  return final.toISOString().slice(0, 10);
}

/**
 * CANTIDAD DE DIAS DISPONIBLES = fecha proyectada final - fecha actual
 * (negativo si ya se pasó la fecha proyectada)
 */
export function calcularDiasDisponibles(
  fechaProyectadaFinal: string | null
): number | null {
  if (!fechaProyectadaFinal) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const final = new Date(fechaProyectadaFinal + "T00:00:00");
  if (isNaN(final.getTime())) return null;
  const diffMs = final.getTime() - hoy.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * RUTA = <carpeta base configurada> + "N°" + "-" + CLIENTE
 * La carpeta base es local (OneDrive del usuario) y se define en Configuración,
 * porque cambia según la máquina/usuario que use la app.
 */
export function calcularRuta(
  carpetaBase: string,
  numero: number,
  cliente: string
): string {
  const base = carpetaBase.replace(/[\\/]+$/, "");
  const clienteLimpio = (cliente || "SIN-CLIENTE").trim();
  const sep = base.includes("\\") ? "\\" : "/";
  return `${base}${sep}${numero}-${clienteLimpio}`;
}

export function calcularAvanceAutomatico(
  fechaInicio: string | null,
  fechaProyectadaFinal: string | null,
  proyectoConGantt: boolean
): number | null {
  // Excel: =IF(Y<>"No","",IF(R<=Q,"",IF(TODAY()>R,100,ROUND(MAX(0,(TODAY()-Q)/(R-Q))*100,2))))
  // Si el proyecto SÍ tiene GANTT, el % avance viene del archivo GANTT (manual, no se calcula aquí)
  if (proyectoConGantt) return null;
  if (!fechaInicio || !fechaProyectadaFinal) return null;
  const inicio = new Date(fechaInicio + "T00:00:00");
  const final = new Date(fechaProyectadaFinal + "T00:00:00");
  if (isNaN(inicio.getTime()) || isNaN(final.getTime())) return null;
  if (final.getTime() <= inicio.getTime()) return null;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (hoy.getTime() > final.getTime()) return 100;
  const avance =
    Math.max(0, (hoy.getTime() - inicio.getTime()) / (final.getTime() - inicio.getTime())) *
    100;
  return Math.round(avance * 100) / 100;
}

export function formatFecha(fecha: string | null): string {
  if (!fecha) return "—";
  const d = new Date(fecha + "T00:00:00");
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-PA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function proyectoConDerivados(p: Proyecto, carpetaBase: string) {
  const fechaProyectadaFinal = calcularFechaProyectadaFinal(
    p.fecha_inicio,
    p.semanas_proyecto
  );
  const diasDisponibles = calcularDiasDisponibles(fechaProyectadaFinal);
  const ruta = calcularRuta(carpetaBase, p.numero, p.cliente);
  return { ...p, fechaProyectadaFinal, diasDisponibles, ruta };
}
