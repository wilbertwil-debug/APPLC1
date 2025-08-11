import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        response: 'Lo siento, el asistente de IA no está configurado. El administrador necesita agregar la variable de entorno GOOGLE_AI_API_KEY para usar esta funcionalidad.',
        error: 'API_KEY_MISSING'
      })
    }

    const systemPrompt = `Eres un asistente especializado en equipos tecnológicos y soporte técnico. Tu función es ayudar con:

1. Especificaciones técnicas de equipos (laptops, desktops, monitores, impresoras, etc.)
2. Compatibilidad entre dispositivos
3. Solución de problemas técnicos
4. Recomendaciones de hardware y software
5. Configuración de equipos
6. Mantenimiento preventivo
7. Actualizaciones y drivers

Responde de manera clara, técnica pero comprensible, y siempre en español. Si no tienes información específica sobre un modelo exacto, proporciona información general útil sobre ese tipo de equipo.

Contexto: ${context || 'soporte_tecnico_general'}

Pregunta del usuario: ${message}`

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error(`Google AI API Error: ${response.status}`, errorData)
      
      // Manejar errores específicos
      if (response.status === 403) {
        const isServiceDisabled = errorData?.error?.details?.some(
          (detail: any) => detail.reason === 'SERVICE_DISABLED'
        )
        
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
            error: 'SERVICE_DISABLED'
          })
        }
      }
      
      if (response.status === 400) {
        return NextResponse.json({
          response: 'Hubo un problema con la solicitud. Por favor, intenta reformular tu pregunta.',
          error: 'BAD_REQUEST'
        })
      }
      
      if (response.status === 429) {
        return NextResponse.json({
          response: 'Se ha alcanzado el límite de solicitudes. Por favor, espera un momento antes de intentar nuevamente.',
          error: 'RATE_LIMIT'
        })
      }

      // Error genérico
      return NextResponse.json({
        response: `Error del servicio de IA (${response.status}). Por favor, intenta nuevamente en unos minutos.`,
        error: 'API_ERROR'
      })
    }

    const data = await response.json()
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude generar una respuesta.'

    return NextResponse.json({ response: aiResponse })
    
  } catch (error) {
    console.error('Error en AI chat:', error)
    return NextResponse.json({
      response: 'Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta nuevamente.',
      error: 'INTERNAL_ERROR'
    })
  }
}
