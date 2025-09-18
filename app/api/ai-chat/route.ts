import { type NextRequest, NextResponse } from "next/server"

interface AITool {
  name: string
  description: string
  parameters: any
}

const availableTools: AITool[] = [
  {
    name: "get_products",
    description:
      "Obtener información de productos del inventario. Puede filtrar por categoría, proveedor, stock bajo, etc.",
    parameters: {
      type: "object",
      properties: {
        category: { type: "string" },
        supplier: { type: "string" },
        low_stock: { type: "boolean" },
        limit: { type: "number", maximum: 50 },
      },
    },
  },
  {
    name: "get_employees",
    description: "Obtener información de empleados del sistema",
    parameters: {
      type: "object",
      properties: {
        user_type: { type: "string", enum: ["admin", "manager", "user"] },
        active: { type: "boolean" },
        limit: { type: "number", maximum: 50 },
      },
    },
  },
  {
    name: "get_suppliers",
    description: "Obtener información de proveedores del sistema",
    parameters: {
      type: "object",
      properties: {
        active: { type: "boolean" },
        limit: { type: "number", maximum: 50 },
      },
    },
  },
  {
    name: "get_categories",
    description: "Obtener información de categorías de productos",
    parameters: {
      type: "object",
      properties: {
        limit: { type: "number", maximum: 50 },
      },
    },
  },
  {
    name: "get_system_stats",
    description: "Obtener estadísticas generales del sistema (resumen de productos, empleados, proveedores)",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "search_information",
    description: "Buscar información específica en productos, empleados, proveedores o categorías",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
        type: { type: "string", enum: ["products", "employees", "suppliers", "categories"] },
      },
      required: ["query"],
    },
  },
]

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        response: `🔧 **Configuración del Asistente IA**

Para usar el asistente de IA necesitas configurar:

**1. API Key de Google AI (Gemini):**
- Ve a: https://makersuite.google.com/app/apikey
- Crea una API key
- Agrégala como variable de entorno: \`GOOGLE_AI_API_KEY\`

**2. Integración con Supabase (opcional):**
- Para consultas de datos en tiempo real
- Configura Supabase en Project Settings

**Funcionalidades disponibles sin configuración:**
- Consultas generales sobre gestión de inventario
- Mejores prácticas y recomendaciones
- Ayuda con procesos y procedimientos

Una vez configurado, podré consultar tu base de datos en tiempo real.`,
        error: "CONFIGURATION_NEEDED",
      })
    }

    const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const systemPrompt = `Eres un asistente especializado en sistemas de gestión de inventario y control de stock.

${
  hasSupabaseConfig
    ? `**CAPACIDADES ACTIVAS:**
- Consultas en tiempo real a la base de datos
- Información actualizada de productos, empleados, proveedores y categorías
- Estadísticas del inventario en vivo
- Alertas de stock bajo`
    : `**MODO CONSULTOR:**
- Consejos sobre gestión de inventario
- Mejores prácticas para control de stock
- Recomendaciones de procesos
- Ayuda general con sistemas de inventario

**NOTA:** Para consultas de datos específicos, necesitas configurar la integración con Supabase.`
}

**INSTRUCCIONES:**
- Responde siempre en español de manera clara y profesional
- Proporciona consejos útiles sobre gestión de inventario
- Si no tienes acceso a datos específicos, ofrece orientación general
- Sé útil y constructivo en tus respuestas

Contexto: ${context || "sistema_gestion_inventario"}
Pregunta del usuario: ${message}`

    let databaseInfo = ""

    if (hasSupabaseConfig) {
      const needsDatabase =
        /\b(producto|empleado|proveedor|categoría|stock|inventario|estadística|cuántos|qué|quién|dónde|mostrar|buscar|información)\b/i.test(
          message,
        )

      if (needsDatabase) {
        try {
          const { getProducts, getEmployees, getSuppliers, getCategories, getSystemStats, searchInformation } =
            await import("@/lib/ai-database-tools")

          if (/producto|stock|inventario/i.test(message)) {
            const result = await getProducts({ limit: 10 })
            if (result.success) {
              databaseInfo += `\n\nINFORMACIÓN DE PRODUCTOS RECIENTES:\n${JSON.stringify(result.data, null, 2)}`
            }
          }

          if (/empleado/i.test(message)) {
            const result = await getEmployees({ active: true, limit: 10 })
            if (result.success) {
              databaseInfo += `\n\nINFORMACIÓN DE EMPLEADOS ACTIVOS:\n${JSON.stringify(result.data, null, 2)}`
            }
          }

          if (/proveedor/i.test(message)) {
            const result = await getSuppliers({ active: true, limit: 10 })
            if (result.success) {
              databaseInfo += `\n\nINFORMACIÓN DE PROVEEDORES:\n${JSON.stringify(result.data, null, 2)}`
            }
          }

          if (/categoría/i.test(message)) {
            const result = await getCategories({ limit: 10 })
            if (result.success) {
              databaseInfo += `\n\nINFORMACIÓN DE CATEGORÍAS:\n${JSON.stringify(result.data, null, 2)}`
            }
          }

          if (/estadística|resumen|cuántos/i.test(message)) {
            const result = await getSystemStats()
            if (result.success) {
              databaseInfo += `\n\nESTADÍSTICAS DEL SISTEMA:\n${JSON.stringify(result.data, null, 2)}`
            }
          }
        } catch (dbError) {
          console.error("Database query error:", dbError)
          databaseInfo += "\n\n[NOTA: No se pudo acceder a la base de datos. Proporcionando respuesta general.]"
        }
      }
    } else {
      if (
        /\b(producto|empleado|proveedor|categoría|stock|inventario|estadística|cuántos|qué|quién|dónde|mostrar|buscar|información)\b/i.test(
          message,
        )
      ) {
        databaseInfo += `\n\n[INFORMACIÓN]: Para consultas específicas de datos, necesitas configurar la integración con Supabase en Project Settings. Mientras tanto, puedo ayudarte con consejos generales y mejores prácticas.`
      }
    }

    const finalPrompt = systemPrompt + databaseInfo

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: finalPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error(`Google AI API Error: ${response.status}`, errorData)

      if (response.status === 403) {
        const isServiceDisabled = errorData?.error?.details?.some((detail: any) => detail.reason === "SERVICE_DISABLED")

        if (isServiceDisabled) {
          return NextResponse.json({
            response: `🔧 **Configuración requerida**

La API de Google Generative Language no está habilitada en tu proyecto de Google Cloud.

**Para solucionarlo:**

1. **Visita Google Cloud Console:**
   https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview

2. **Habilita la API:**
   - Haz clic en "ENABLE" (Habilitar)
   - Espera unos minutos para que se propague

3. **Verifica tu API Key:**
   - Ve a https://makersuite.google.com/app/apikey
   - Asegúrate de que tu clave esté activa

4. **Reinicia la aplicación** después de habilitar la API

Una vez habilitada, podrás usar todas las funciones del asistente de IA.`,
            error: "SERVICE_DISABLED",
          })
        }
      }

      if (response.status === 400) {
        return NextResponse.json({
          response: "Hubo un problema con la solicitud. Por favor, intenta reformular tu pregunta.",
          error: "BAD_REQUEST",
        })
      }

      if (response.status === 429) {
        return NextResponse.json({
          response:
            "Se ha alcanzado el límite de solicitudes. Por favor, espera un momento antes de intentar nuevamente.",
          error: "RATE_LIMIT",
        })
      }

      if (response.status === 503) {
        return NextResponse.json({
          response: `⏳ **Gemini está temporalmente sobrecargado**

El modelo de IA está procesando muchas solicitudes en este momento.

**Soluciones:**
- Espera 1-2 minutos e intenta nuevamente
- El servicio se restablecerá automáticamente
- Tu configuración está correcta

**Mientras tanto puedes:**
- Consultar información general sobre gestión de inventario
- Revisar los datos directamente en las páginas del sistema

¡Tu asistente IA está funcionando correctamente!`,
          error: "MODEL_OVERLOADED",
        })
      }

      return NextResponse.json({
        response: `Error del servicio de IA (${response.status}). Por favor, intenta nuevamente en unos minutos.`,
        error: "API_ERROR",
      })
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta."

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("Error en AI chat:", error)
    return NextResponse.json({
      response: "Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta nuevamente.",
      error: "INTERNAL_ERROR",
    })
  }
}
