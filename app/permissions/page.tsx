'use client'

import { Navigation } from '@/components/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { PermissionsInfo } from '@/components/permissions-info'
import { usePermissions } from '@/contexts/permissions-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

export default function PermissionsPage() {
  const { permissions } = usePermissions()

  // Solo admins pueden acceder a esta página
  if (!permissions?.canAccessAdminPanel) {
    return (
      <ProtectedRoute>
        <div className="flex h-screen bg-gray-50">
          <Navigation />
          <div className="flex-1 md:ml-64">
            <div className="p-4 md:p-8">
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="space-y-2">
                    <p className="font-medium">Acceso Denegado</p>
                    <p>No tienes permisos para acceder a esta página. Solo los administradores pueden ver la configuración de permisos.</p>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Navigation />
        <div className="flex-1 md:ml-64">
          <div className="p-4 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Permisos</h1>
              <p className="text-gray-600">Configuración de permisos y roles de usuario</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PermissionsInfo />
              
              <div className="space-y-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Información sobre Roles</p>
                      <div className="text-sm space-y-1">
                        <p><strong>Administrador:</strong> Acceso completo a todos los módulos</p>
                        <p><strong>Gerente:</strong> Puede gestionar equipos, empleados y tickets, pero no eliminar</p>
                        <p><strong>Usuario:</strong> Solo puede crear tickets y agregar comentarios</p>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
