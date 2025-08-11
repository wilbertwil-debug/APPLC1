'use client'

import { useState } from 'react'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Bot, User, Send, Loader2, AlertTriangle, ExternalLink, Settings } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  error?: string
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA para equipos tecnológicos. Puedes preguntarme sobre características técnicas, especificaciones, compatibilidad, solución de problemas y más. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setConfigError(null)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          context: 'equipment_technical_support',
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        error: data.error
      }

      setMessages(prev => [...prev, assistantMessage])

      // Manejar errores específicos
      if (data.error) {
        if (data.error === 'SERVICE_DISABLED') {
          setConfigError('SERVICE_DISABLED')
        } else if (data.error === 'API_KEY_MISSING') {
          setConfigError('API_KEY_MISSING')
        }
      }

    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar con el servidor',
        variant: 'destructive',
      })

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, hubo un error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.',
        timestamp: new Date(),
        error: 'CONNECTION_ERROR'
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const suggestedQuestions = [
    '¿Cuáles son las especificaciones de una laptop Dell Latitude 7420?',
    '¿Qué características tiene un monitor LG UltraWide 34"?',
    '¿Cómo solucionar problemas de conectividad en impresoras HP?',
    '¿Qué diferencias hay entre procesadores Intel i5 e i7?',
    '¿Cuáles son los requisitos para instalar Windows 11?',
  ]

  const ConfigurationAlert = () => {
    if (!configError) return null

    return (
      <Alert className="mb-6 border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Configuración requerida</AlertTitle>
        <AlertDescription className="text-orange-700 mt-2">
          {configError === 'SERVICE_DISABLED' && (
            <div className="space-y-3">
              <p>La API de Google Generative Language no está habilitada.</p>
              <div className="space-y-2">
                <p className="font-medium">Para solucionarlo:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    <a 
                      href="https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Habilita la API en Google Cloud Console
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Espera unos minutos para que se propague</li>
                  <li>Reinicia la aplicación</li>
                </ol>
              </div>
            </div>
          )}
          {configError === 'API_KEY_MISSING' && (
            <div className="space-y-3">
              <p>La clave de API de Google AI no está configurada.</p>
              <div className="space-y-2">
                <p className="font-medium">Para solucionarlo:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>
                    <a 
                      href="https://makersuite.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      Obtén una API Key en Google AI Studio
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                  <li>Agrega la clave como GOOGLE_AI_API_KEY en .env.local</li>
                  <li>Reinicia la aplicación</li>
                </ol>
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Navigation />
        <div className="flex-1 md:ml-64">
          <div className="flex flex-col h-full">
            <div className="p-4 md:p-8 pb-4">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Asistente de IA</h1>
                <p className="text-gray-600">Consulta sobre equipos tecnológicos con inteligencia artificial</p>
              </div>
              
              <ConfigurationAlert />
            </div>

            <div className="flex-1 px-4 md:px-8 pb-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                {/* Chat Area */}
                <div className="lg:col-span-3">
                  <Card className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-blue-600" />
                        Chat con Asistente IA
                        {configError && (
                          <div className="flex items-center gap-1 text-orange-600">
                            <Settings className="h-4 w-4" />
                            <span className="text-xs">Configuración requerida</span>
                          </div>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Pregunta sobre características técnicas, especificaciones y soporte
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ScrollArea className="flex-1 pr-4 mb-4">
                        <div className="space-y-4">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex gap-3 ${
                                message.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`flex gap-3 max-w-[80%] ${
                                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                                }`}
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.role === 'user'
                                      ? 'bg-blue-600 text-white'
                                      : message.error
                                      ? 'bg-orange-200 text-orange-600'
                                      : 'bg-gray-200 text-gray-600'
                                  }`}
                                >
                                  {message.role === 'user' ? (
                                    <User className="h-4 w-4" />
                                  ) : message.error ? (
                                    <AlertTriangle className="h-4 w-4" />
                                  ) : (
                                    <Bot className="h-4 w-4" />
                                  )}
                                </div>
                                <div
                                  className={`rounded-lg px-4 py-2 ${
                                    message.role === 'user'
                                      ? 'bg-blue-600 text-white'
                                      : message.error
                                      ? 'bg-orange-50 text-orange-900 border border-orange-200'
                                      : 'bg-gray-100 text-gray-900'
                                  }`}
                                >
                                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                                  <p
                                    className={`text-xs mt-1 ${
                                      message.role === 'user'
                                        ? 'text-blue-100'
                                        : message.error
                                        ? 'text-orange-600'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    {formatTime(message.timestamp)}
                                    {message.error && (
                                      <span className="ml-2 font-medium">
                                        • Configuración requerida
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {loading && (
                            <div className="flex gap-3 justify-start">
                              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-4 w-4" />
                              </div>
                              <div className="bg-gray-100 rounded-lg px-4 py-2">
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-sm text-gray-600">Pensando...</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Pregunta sobre equipos tecnológicos..."
                          disabled={loading}
                          className="flex-1"
                        />
                        <Button type="submit" disabled={loading || !input.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                {/* Suggestions Sidebar */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Preguntas Sugeridas</CardTitle>
                      <CardDescription>
                        Ejemplos de consultas que puedes hacer
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {suggestedQuestions.map((question, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            className="w-full text-left h-auto p-3 text-sm"
                            onClick={() => setInput(question)}
                            disabled={loading}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-lg">Estado del Servicio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${configError ? 'bg-orange-500' : 'bg-green-500'}`}></div>
                          <span className="font-medium">
                            {configError ? 'Configuración requerida' : 'Servicio activo'}
                          </span>
                        </div>
                        
                        {!configError && (
                          <div className="space-y-2 text-gray-600">
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Especificaciones técnicas</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Compatibilidad de dispositivos</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Solución de problemas</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span>Recomendaciones de hardware</span>
                            </div>
                          </div>
                        )}
                        
                        {configError && (
                          <div className="text-orange-600 text-xs">
                            <p>El asistente necesita configuración adicional para funcionar.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
