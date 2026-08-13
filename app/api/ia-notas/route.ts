import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const PROMPTS: Record<string, string> = {
  mejorar:
    "Mejoras la redacción de notas de proyecto o de reunión con clientes, escritas en español. " +
    "Corrige ortografía y gramática, ordena las ideas y dale un tono claro y profesional, " +
    "propio de gestión de proyectos. No inventes información que no esté en el texto original " +
    "y no agregues datos, fechas ni compromisos nuevos. Responde ÚNICAMENTE con el texto " +
    "mejorado, sin introducciones, comentarios ni comillas.",
  resumir:
    "Resumes notas de reunión con clientes, escritas en español, en viñetas breves con los " +
    "puntos clave y, si se mencionan, los próximos pasos o compromisos. No inventes " +
    "información que no esté en el texto original. Responde ÚNICAMENTE con el resumen en " +
    "viñetas, sin introducciones ni comentarios.",
};

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Falta configurar ANTHROPIC_API_KEY en las variables de entorno de Vercel.",
      },
      { status: 500 }
    );
  }

  let body: { texto?: string; modo?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const texto = (body.texto ?? "").trim();
  const modo = body.modo === "resumir" ? "resumir" : "mejorar";

  if (!texto) {
    return NextResponse.json(
      { error: "No hay texto para procesar." },
      { status: 400 }
    );
  }

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        system: PROMPTS[modo],
        messages: [{ role: "user", content: texto }],
      }),
    });

    if (!resp.ok) {
      const detalle = await resp.text();
      return NextResponse.json(
        { error: `Error de la IA (${resp.status}): ${detalle.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await resp.json();
    const resultado = (data?.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n")
      .trim();

    if (!resultado) {
      return NextResponse.json(
        { error: "La IA no devolvió texto." },
        { status: 502 }
      );
    }

    return NextResponse.json({ resultado });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Error al conectar con la IA.",
      },
      { status: 500 }
    );
  }
}
