"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Database, Brain, Shield, ExternalLink, FileText } from "lucide-react"

interface ConfigurationSetupProps {
  missingVars: string[]
}

export function ConfigurationSetup({ missingVars }: ConfigurationSetupProps) {
  const envVars = [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      description: "URL de tu proyecto Supabase",
      required: true,
      icon: Database,
      present: !missingVars.includes("NEXT_PUBLIC_SUPABASE_URL"),
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      description: "Clave anónima de Supabase",
      required: true,
      icon: Shield,
      present: !missingVars.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    },
    {
      name: "GOOGLE_AI_API_KEY",
      description: "Clave de Google AI para el asistente (opcional)",
      required: false,
      icon: Brain,
      present: !missingVars.includes("GOOGLE_AI_API_KEY"),
    },
  ]

  const requiredMissing = envVars.filter((v) => v.required && !v.present).length > 0

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
                ? "Configura las variables de entorno para usar la aplicación"
                : "Configuración completada correctamente"}
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
                      envVar.present ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`h-5 w-5 ${envVar.present ? "text-green-600" : "text-red-600"}`} />
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
                      <Badge variant={envVar.present ? "default" : "destructive"} className="text-xs">
                        {envVar.present ? "Configurado" : "Falta"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-800">Archivo .env.local</h4>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Crea un archivo llamado <code className="bg-blue-100 px-1 rounded">.env.local</code> en la raíz de tu
                proyecto con las variables de entorno necesarias.
              </p>
              <div className="bg-blue-100 p-3 rounded text-xs text-blue-800">
                <p className="font-medium mb-1">Formato:</p>
                <p>VARIABLE_NAME=tu_valor_aqui</p>
                <p className="mt-2 text-blue-600">
                  Obtén los valores desde los dashboards correspondientes (Supabase, Google AI Studio)
                </p>
              </div>
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
                    <li>Ve a Settings {">"} API</li>
                    <li>Copia la "Project URL"</li>
                    <li>Copia la "anon public" key</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">3. Agregar a .env.local</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Agrega la URL del proyecto</li>
                    <li>Agrega la clave anónima</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="font-medium">4. Configurar base de datos</p>
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
                  <p className="text-gray-600">Copia la clave y agrégala al archivo de configuración</p>
                </div>

                <div className="bg-blue-50 p-3 rounded text-xs">
                  <p className="font-medium text-blue-800 mb-1">Nota:</p>
                  <p className="text-blue-700">
                    El asistente IA funcionará sin esta configuración, pero mostrará un mensaje indicando que no está
                    disponible.
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
                  <p className="text-gray-600">Agrega las credenciales obtenidas de los servicios correspondientes</p>
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
