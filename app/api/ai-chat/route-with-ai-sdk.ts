import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

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
      return NextResponse.json(
        { response: 'Lo siento, el asistente de IA no está configurado. Necesitas agregar la variable de entorno GOOGLE_AI_API_KEY para usar esta funcionalidad.' }
      )
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

Contexto: ${context || 'soporte_tecnico_general'}`

    const { text } = await generateText({
      model: google('models/gemini-1.5-flash-latest'),
      system: systemPrompt,
      prompt: message,
      maxTokens: 2048,
      temperature: 0.7,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error('Error en AI chat:', error)
    return NextResponse.json(
      { response: 'Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta nuevamente.' }
    )
  }
}
