'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle, Database, Brain, Shield, ExternalLink, Copy } from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface ConfigurationSetupProps {
  missingVars: string[]
}

export function ConfigurationSetup({ missingVars }: ConfigurationSetupProps) {
  const [copiedEnv, setCopiedEnv] = useState(false)
  const { toast } = useToast()

  const envVars = [
    {
      name: 'NEXT_PUBLIC_SUPABASE_URL',
      description: 'URL de tu proyecto Supabase',
      required: true,
      icon: Database,
      present: !missingVars.includes('NEXT_PUBLIC_SUPABASE_URL'),
      example: 'https://tu-proyecto.supabase.co'
    },
    {
      name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      description: 'Clave anónima de Supabase',
      required: true,
      icon: Shield,
      present: !missingVars.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
    {
      name: 'GOOGLE_AI_API_KEY',
      description: 'Clave de Google AI para el asistente (opcional)',
      required: false,
      icon: Brain,
      present: !missingVars.includes('GOOGLE_AI_API_KEY'),
      example: 'AIzaSyD...'
    },
  ]

  const requiredMissing = envVars.filter(v => v.required && !v.present).length > 0

  const copyEnvTemplate = () => {
    const template = `# Configuración de Supabase (Requerido)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Configuración de Google AI (Opcional)
GOOGLE_AI_API_KEY=tu_clave_google_ai_aqui`

    navigator.clipboard.writeText(template).then(() => {
      setCopiedEnv(true)
      toast({
        title: 'Copiado',
        description: 'Template de .env.local copiado al portapapeles',
      })
      setTimeout(() => setCopiedEnv(false), 2000)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-4xl w-full space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              {requiredMissing ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                <CheckCircle className="h-6 w-6 text-green-600" />
              )}
              Configuración del Sistema de Inventario
            </CardTitle>
            <CardDescription>
              {requiredMissing
                ? 'Configura las variables de entorno para usar la aplicación'
                : 'Configuración completada correctamente'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {envVars.map((envVar) => {
                const Icon = envVar.icon
                return (
                  <div
                    key={envVar.name}
                    className={`p-4 border rounded-lg ${
                      envVar.present ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${envVar.present ? 'text-green-600' : 'text-red-600'}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{envVar.name}</p>
                        <p className="text-xs text-gray-500">{envVar.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {envVar.required && (
                        <Badge variant="outline" className="text-xs">
                          Requerido
                        </Badge>
                      )}
                      <Badge
                        variant={envVar.present ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {envVar.present ? 'Configurado' : 'Falta'}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Template .env.local</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEnvTemplate}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copiedEnv ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`# Configuración de Supabase (Requerido)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui

# Configuración de Google AI (Opcional)
GOOGLE_AI_API_KEY=tu_clave_google_ai_aqui`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Configurar Supabase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">1. Crear proyecto</p>
                  <p className="text-gray-600">Ve a supabase.com y crea un nuevo proyecto</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ir a Supabase
                    </a>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">2. Obtener credenciales</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Ve a Settings {'>'} API</li>
                    <li>Copia la "Project URL"</li>
                    <li>Copia la "anon public" key</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">3. Configurar base de datos</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Ve al editor SQL de Supabase</li>
                    <li>Ejecuta el script de creación de tablas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Configurar Google AI (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">1. Obtener API Key</p>
                  <p className="text-gray-600">Ve a Google AI Studio para crear una clave</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Google AI Studio
                    </a>
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <p className="font-medium">2. Agregar a .env.local</p>
                  <p className="text-gray-600">Copia la clave y agrégala como GOOGLE_AI_API_KEY</p>
                </div>

                <div className="bg-blue-50 p-3 rounded text-xs">
                  <p className="font-medium text-blue-800 mb-1">Nota:</p>
                  <p className="text-blue-700">
                    El asistente IA funcionará sin esta configuración, 
                    pero mostrará un mensaje indicando que no está disponible.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pasos Finales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium">Crear archivo .env.local</p>
                  <p className="text-gray-600">En la raíz del proyecto, crea un archivo llamado .env.local</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium">Agregar variables de entorno</p>
                  <p className="text-gray-600">Copia el template de arriba y reemplaza con tus valores reales</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium">Reiniciar servidor</p>
                  <p className="text-gray-600">Detén y vuelve a iniciar el servidor de desarrollo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
