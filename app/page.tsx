"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Persona, Proyecto, ProyectoInput } from "@/lib/types";
import FilterBar, { Filtros, FILTROS_VACIOS } from "@/components/FilterBar";
import ProjectTable from "@/components/ProjectTable";
import ProjectForm from "@/components/ProjectForm";
import QuickAddModal from "@/components/QuickAddModal";
import SettingsPanel from "@/components/SettingsPanel";

export default function Home() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [asignadosDb, setAsignadosDb] = useState<Persona[]>([]);
  const [ejecutivosDb, setEjecutivosDb] = useState<Persona[]>([]);
  const [carpetaBase, setCarpetaBase] = useState(
    "C:\\Users\\abraham.picota\\OneDrive - Pagero AB\\Proyectos"
  );
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const [filtros, setFiltros] = useState<Filtros>(FILTROS_VACIOS);
  const [proyectoEditando, setProyectoEditando] = useState<Proyecto | null>(
    null
  );
  const [creandoNuevo, setCreandoNuevo] = useState(false);
  const [mostrarConfig, setMostrarConfig] = useState(false);
  const [mostrarAgregarNota, setMostrarAgregarNota] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    setErrorCarga(null);
    const [{ data: proyectosData, error: e1 }, { data: personasData, error: e2 }, { data: configData, error: e3 }] =
      await Promise.all([
        supabase.from("proyectos").select("*").order("numero", { ascending: false }),
        supabase.from("personas").select("*").order("nombre"),
        supabase.from("configuracion").select("*").eq("id", 1).single(),
      ]);

    if (e1 || e2 || e3) {
      setErrorCarga(
        (e1 || e2 || e3)?.message ??
          "No se pudo conectar con Supabase. Revisa tus credenciales en .env.local."
      );
      setCargando(false);
      return;
    }

    setProyectos(proyectosData ?? []);
    setPersonas(personasData ?? []);
    setAsignadosDb((personasData ?? []).filter((p) => p.rol === "ASIGNADO"));
    setEjecutivosDb(
      (personasData ?? []).filter((p) => p.rol === "EJECUTIVO_COMERCIAL")
    );
    if (configData?.carpeta_base) setCarpetaBase(configData.carpeta_base);
    setCargando(false);
  }

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proyectosFiltrados = useMemo(() => {
    return proyectos.filter((p) => {
      if (filtros.estado && p.estado !== filtros.estado) return false;
      if (filtros.prioridad && p.prioridad !== filtros.prioridad) return false;
      if (filtros.tipoTarea && p.tipo_tarea !== filtros.tipoTarea) return false;
      if (filtros.asignado && p.asignado !== filtros.asignado) return false;
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const campos = [p.cliente, p.nombre_hubspot, p.nv, p.ruc, p.tarea];
        if (!campos.some((c) => c?.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [proyectos, filtros]);

  const siguienteNumero =
    proyectos.length > 0 ? Math.max(...proyectos.map((p) => p.numero)) + 1 : 1;

  async function guardarProyecto(data: ProyectoInput, id: string | null) {
    // Si el asignado/ejecutivo es nuevo, lo registramos en la lista de personas
    await Promise.all([
      registrarPersonaSiEsNueva(data.asignado, "ASIGNADO"),
      registrarPersonaSiEsNueva(data.ejecutivo_comercial, "EJECUTIVO_COMERCIAL"),
    ]);

    if (id) {
      const { error } = await supabase.from("proyectos").update(data).eq("id", id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("proyectos").insert(data);
      if (error) throw error;
    }
    setProyectoEditando(null);
    setCreandoNuevo(false);
    await cargarTodo();
  }

  async function registrarPersonaSiEsNueva(
    nombre: string | null,
    rol: "ASIGNADO" | "EJECUTIVO_COMERCIAL"
  ) {
    if (!nombre || !nombre.trim()) return;
    const yaExiste = personas.some(
      (p) => p.rol === rol && p.nombre.toLowerCase() === nombre.trim().toLowerCase()
    );
    if (yaExiste) return;
    await supabase.from("personas").insert({ nombre: nombre.trim(), rol });
  }

  async function eliminarProyecto(id: string) {
    if (!confirm("¿Eliminar este proyecto? Esta acción no se puede deshacer."))
      return;
    const { error } = await supabase.from("proyectos").delete().eq("id", id);
    if (error) {
      alert(error.message);
      return;
    }
    setProyectoEditando(null);
    await cargarTodo();
  }

  async function guardarCarpetaBase(v: string) {
    setCarpetaBase(v);
    await supabase.from("configuracion").update({ carpeta_base: v }).eq("id", 1);
  }

  async function agregarPersona(
    nombre: string,
    rol: "ASIGNADO" | "EJECUTIVO_COMERCIAL"
  ) {
    await supabase.from("personas").insert({ nombre, rol });
    const { data } = await supabase.from("personas").select("*").order("nombre");
    setPersonas(data ?? []);
    setAsignadosDb((data ?? []).filter((p) => p.rol === "ASIGNADO"));
    setEjecutivosDb((data ?? []).filter((p) => p.rol === "EJECUTIVO_COMERCIAL"));
  }

  async function eliminarPersona(id: string) {
    await supabase.from("personas").delete().eq("id", id);
    const { data } = await supabase.from("personas").select("*").order("nombre");
    setPersonas(data ?? []);
    setAsignadosDb((data ?? []).filter((p) => p.rol === "ASIGNADO"));
    setEjecutivosDb((data ?? []).filter((p) => p.rol === "EJECUTIVO_COMERCIAL"));
  }

  const nombresAsignados = Array.from(
    new Set([
      ...asignadosDb.map((p) => p.nombre),
      ...proyectos.map((p) => p.asignado).filter(Boolean) as string[],
    ])
  ).sort();
  const nombresEjecutivos = Array.from(
    new Set([
      ...ejecutivosDb.map((p) => p.nombre),
      ...proyectos.map((p) => p.ejecutivo_comercial).filter(Boolean) as string[],
    ])
  ).sort();

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
              Implementación de clientes
            </p>
            <h1 className="text-xl font-semibold text-ink-900">
              Gestor de Proyectos
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMostrarConfig(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-800 hover:bg-slate-50"
            >
              Configuración
            </button>
            <button
              onClick={() => setMostrarAgregarNota(true)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-800 hover:bg-slate-50"
            >
              + Hito / Reunión
            </button>
            <button
              onClick={() => setCreandoNuevo(true)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
            >
              + Nuevo proyecto
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6">
        {errorCarga && (
          <div className="mb-4 rounded-lg border border-rust-500/30 bg-rust-500/10 px-4 py-3 text-sm text-rust-500">
            {errorCarga}
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <FilterBar
            filtros={filtros}
            onChange={setFiltros}
            asignados={nombresAsignados}
          />
          <p className="text-xs text-slate-400">
            {proyectosFiltrados.length} de {proyectos.length} proyectos
          </p>
        </div>

        {cargando ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400 shadow-card">
            Cargando proyectos…
          </div>
        ) : (
          <ProjectTable
            proyectos={proyectosFiltrados}
            onSelect={setProyectoEditando}
            carpetaBase={carpetaBase}
          />
        )}
      </div>

      {(creandoNuevo || proyectoEditando) && (
        <ProjectForm
          proyecto={proyectoEditando}
          siguienteNumero={siguienteNumero}
          carpetaBase={carpetaBase}
          asignados={nombresAsignados}
          ejecutivos={nombresEjecutivos}
          onCancel={() => {
            setCreandoNuevo(false);
            setProyectoEditando(null);
          }}
          onSave={guardarProyecto}
          onDelete={proyectoEditando ? eliminarProyecto : undefined}
        />
      )}

      {mostrarAgregarNota && (
        <QuickAddModal
          proyectos={proyectos}
          onClose={() => setMostrarAgregarNota(false)}
        />
      )}

      {mostrarConfig && (
        <SettingsPanel
          carpetaBase={carpetaBase}
          asignados={asignadosDb}
          ejecutivos={ejecutivosDb}
          onClose={() => setMostrarConfig(false)}
          onGuardarCarpetaBase={guardarCarpetaBase}
          onAgregarPersona={agregarPersona}
          onEliminarPersona={eliminarPersona}
        />
      )}
    </main>
  );
}
