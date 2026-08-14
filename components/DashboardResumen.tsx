"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ESTADOS_PIPELINE, PRIORIDADES, Proyecto } from "@/lib/types";
import {
  calcularAvanceAutomatico,
  calcularDiasDisponibles,
  calcularFechaProyectadaFinal,
} from "@/lib/calculations";
import EstadoPill from "./EstadoPill";

const COLORES_ESTADO: Record<string, string> = {
  "Area Comercial": "#94A3B8",
  Inicio: "#B3D7F3",
  Integración: "#4E9EDD",
  Implementación: "#E1A15C",
  Pruebas: "#D48A3C",
  "Go Live / Hyper Care": "#1E68AA",
};

const COLORES_PRIORIDAD: Record<string, string> = {
  Alto: "#C55A3A",
  Medio: "#D48A3C",
  Bajo: "#4E9EDD",
};

const estiloTooltip = {
  borderRadius: 8,
  borderColor: "#E2E8F0",
  fontSize: 12,
};

interface TickPayload {
  value: string;
}

function TarjetaReporte({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card">
      <h3 className="text-sm font-semibold text-ink-900">{titulo}</h3>
      <p className="mb-2 text-xs text-slate-400">{subtitulo}</p>
      {children}
    </div>
  );
}

function GraficoAvance({
  datos,
}: {
  datos: { cliente: string; estado: string; avance: number }[];
}) {
  function TickPersonalizado({
    x,
    y,
    payload,
  }: {
    x: number;
    y: number;
    payload: TickPayload;
  }) {
    const item = datos.find((d) => d.cliente === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={14} textAnchor="middle" fontSize={10} fill="#8492A6">
          {item?.estado}
        </text>
        <text
          x={0}
          y={30}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill="#111A2E"
        >
          {payload.value.length > 16
            ? `${payload.value.slice(0, 16)}…`
            : payload.value}
        </text>
      </g>
    );
  }

  return (
    <TarjetaReporte
      titulo="Porcentaje de avance de proyectos"
      subtitulo="Proyectos activos (todo lo que no está Cerrado ni Suspendido)."
    >
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <BarChart data={datos} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F6" />
            <XAxis
              dataKey="cliente"
              interval={0}
              height={44}
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={(props: any) => <TickPersonalizado {...props} />}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              width={32}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
            />
            <Tooltip
              cursor={{ fill: "#F1F5F9" }}
              formatter={(value: number) => [`${value}%`, "% Avance"]}
              labelFormatter={(label: string) => {
                const item = datos.find((d) => d.cliente === label);
                return item ? `${item.cliente} — ${item.estado}` : label;
              }}
              contentStyle={estiloTooltip}
            />
            <Bar dataKey="avance" fill="#2C82C9" radius={[4, 4, 0, 0]} maxBarSize={56} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </TarjetaReporte>
  );
}

function GraficoEstado({
  datos,
}: {
  datos: { estado: string; cantidad: number }[];
}) {
  const conValor = datos.filter((d) => d.cantidad > 0);
  return (
    <TarjetaReporte
      titulo="Distribución por estado"
      subtitulo="Proyectos activos agrupados por etapa."
    >
      {conValor.length === 0 ? (
        <p className="py-16 text-center text-xs text-slate-400">Sin datos.</p>
      ) : (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={conValor}
                dataKey="cantidad"
                nameKey="estado"
                innerRadius={48}
                outerRadius={76}
                paddingAngle={2}
              >
                {conValor.map((d) => (
                  <Cell key={d.estado} fill={COLORES_ESTADO[d.estado] ?? "#94A3B8"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} proyecto(s)`,
                  name,
                ]}
                contentStyle={estiloTooltip}
              />
              <Legend
                verticalAlign="bottom"
                height={54}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </TarjetaReporte>
  );
}

function GraficoPrioridad({
  datos,
}: {
  datos: { prioridad: string; cantidad: number }[];
}) {
  return (
    <TarjetaReporte
      titulo="Proyectos por prioridad"
      subtitulo="Cantidad de proyectos activos por nivel."
    >
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={datos} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EEF1F6" />
            <XAxis
              dataKey="prioridad"
              tickLine={false}
              axisLine={{ stroke: "#E2E8F0" }}
              tick={{ fontSize: 12, fill: "#475569" }}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={28}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
            />
            <Tooltip
              cursor={{ fill: "#F1F5F9" }}
              formatter={(value: number) => [`${value} proyecto(s)`, "Cantidad"]}
              contentStyle={estiloTooltip}
            />
            <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} maxBarSize={64}>
              {datos.map((d) => (
                <Cell key={d.prioridad} fill={COLORES_PRIORIDAD[d.prioridad] ?? "#2C82C9"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </TarjetaReporte>
  );
}

function GraficoAsignado({
  datos,
}: {
  datos: { asignado: string; cantidad: number }[];
}) {
  const altura = Math.max(180, datos.length * 34 + 40);
  return (
    <TarjetaReporte
      titulo="Proyectos por asignado"
      subtitulo="Carga de trabajo activa por persona."
    >
      {datos.length === 0 ? (
        <p className="py-16 text-center text-xs text-slate-400">Sin datos.</p>
      ) : (
        <div style={{ width: "100%", height: altura }}>
          <ResponsiveContainer>
            <BarChart
              data={datos}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EEF1F6" />
              <XAxis
                type="number"
                allowDecimals={false}
                tickLine={false}
                axisLine={{ stroke: "#E2E8F0" }}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
              />
              <YAxis
                type="category"
                dataKey="asignado"
                width={110}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#334155" }}
              />
              <Tooltip
                cursor={{ fill: "#F1F5F9" }}
                formatter={(value: number) => [`${value} proyecto(s)`, "Cantidad"]}
                contentStyle={estiloTooltip}
              />
              <Bar dataKey="cantidad" fill="#2C82C9" radius={[0, 4, 4, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </TarjetaReporte>
  );
}

export default function DashboardResumen({
  proyectos,
  onSelect,
}: {
  proyectos: Proyecto[];
  onSelect: (p: Proyecto) => void;
}) {
  const activos = proyectos.filter(
    (p) => p.estado !== "Cerrado" && p.estado !== "Suspendido"
  );

  const conteosEstado = ESTADOS_PIPELINE.map((estado) => ({
    estado,
    cantidad: activos.filter((p) => p.estado === estado).length,
  }));

  const conteosPrioridad = PRIORIDADES.map((prioridad) => ({
    prioridad,
    cantidad: activos.filter((p) => p.prioridad === prioridad).length,
  }));

  const mapaAsignados = new Map<string, number>();
  activos.forEach((p) => {
    const nombre = p.asignado?.trim() || "Sin asignar";
    mapaAsignados.set(nombre, (mapaAsignados.get(nombre) ?? 0) + 1);
  });
  const conteosAsignado = Array.from(mapaAsignados, ([asignado, cantidad]) => ({
    asignado,
    cantidad,
  })).sort((a, b) => b.cantidad - a.cantidad);

  const filas = activos
    .map((p) => {
      const fechaFinal = calcularFechaProyectadaFinal(
        p.fecha_inicio,
        p.semanas_proyecto
      );
      const dias = calcularDiasDisponibles(fechaFinal);
      const avance = p.proyecto_con_gantt
        ? p.porcentaje_avance
        : calcularAvanceAutomatico(p.fecha_inicio, fechaFinal, false) ??
          p.porcentaje_avance;
      return { p, dias, avance };
    })
    .sort((a, b) => {
      if (a.dias === null) return 1;
      if (b.dias === null) return -1;
      return a.dias - b.dias;
    });

  const datosGraficoAvance = [...activos]
    .sort((a, b) => {
      const ia = ESTADOS_PIPELINE.indexOf(
        a.estado as (typeof ESTADOS_PIPELINE)[number]
      );
      const ib = ESTADOS_PIPELINE.indexOf(
        b.estado as (typeof ESTADOS_PIPELINE)[number]
      );
      if (ia !== ib) return ia - ib;
      return a.cliente.localeCompare(b.cliente);
    })
    .map((p) => {
      const fechaFinal = calcularFechaProyectadaFinal(
        p.fecha_inicio,
        p.semanas_proyecto
      );
      const avance = p.proyecto_con_gantt
        ? p.porcentaje_avance
        : calcularAvanceAutomatico(p.fecha_inicio, fechaFinal, false) ??
          p.porcentaje_avance;
      return {
        cliente: p.cliente,
        estado: p.estado,
        avance: Math.round(avance ?? 0),
      };
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        {conteosEstado.map((c) => (
          <div
            key={c.estado}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-card"
          >
            <p className="text-2xl font-semibold text-ink-900">{c.cantidad}</p>
            <p className="mt-1 text-xs leading-tight text-slate-500">
              {c.estado}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GraficoEstado datos={conteosEstado} />
        <GraficoPrioridad datos={conteosPrioridad} />
        <GraficoAsignado datos={conteosAsignado} />
      </div>

      {datosGraficoAvance.length > 0 && (
        <GraficoAvance datos={datosGraficoAvance} />
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-ink-900">
            Clientes activos ({activos.length})
          </h3>
          <p className="text-xs text-slate-400">
            Todo lo que no está Cerrado ni Suspendido, ordenado por urgencia
            (menos días disponibles primero).
          </p>
        </div>
        <div className="thin-scroll overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs uppercase tracking-tight text-slate-500">
                <th className="px-4 py-2 font-medium">Cliente</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium">Prioridad</th>
                <th className="px-4 py-2 font-medium">Asignado</th>
                <th className="px-4 py-2 font-medium">% Avance</th>
                <th className="px-4 py-2 font-medium">Días disponibles</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ p, dias, avance }) => (
                <tr
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-brand-50/40"
                >
                  <td className="whitespace-nowrap px-4 py-2 font-medium text-ink-900">
                    {p.cliente}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2">
                    <EstadoPill estado={p.estado} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                    {p.prioridad}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                    {p.asignado || "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-slate-600">
                    {avance === null ? "—" : `${avance}%`}
                  </td>
                  <td
                    className={`whitespace-nowrap px-4 py-2 font-medium ${
                      dias !== null && dias < 0
                        ? "text-rust-500"
                        : "text-ink-800"
                    }`}
                  >
                    {dias === null ? "—" : `${dias} d`}
                  </td>
                </tr>
              ))}
              {filas.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-400"
                  >
                    No hay proyectos activos en este momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
