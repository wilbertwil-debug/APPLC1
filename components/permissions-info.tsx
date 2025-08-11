'use client'

import { usePermissions } from '@/contexts/permissions-context'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, User, Eye, Edit, Plus, Trash2, Lock } from 'lucide-react'

export function PermissionsInfo() {
  const { permissions, loading } = usePermissions()
  const { user } = useAuth()

  if (loading || !permissions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permisos de Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
            <span>Cargando permisos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'manager':
        return 'Gerente'
      case 'user':
        return 'Usuario'
      default:
        return role
    }
  }

  const modules = [
    { key: 'dashboard', name: 'Dashboard', icon: '📊' },
    { key: 'equipment', name: 'Equipos', icon: '💻' },
    { key: 'employees', name: 'Empleados', icon: '👥' },
    { key: 'users', name: 'Usuarios', icon: '👤' },
    { key: 'tickets', name: 'Tickets', icon: '🎫' },
    { key: 'equipmentTypes', name: 'Tipos de Equipos', icon: '⚙️' },
    { key: 'serviceStations', name: 'Estaciones de Servicio', icon: '🏢' },
    { key: 'aiAssistant', name: 'Asistente IA', icon: '🤖' },
  ]

  const getPermissionIcon = (action: string) => {
    switch (action) {
      case 'read':
        return <Eye className="h-3 w-3" />
      case 'create':
        return <Plus className="h-3 w-3" />
      case 'update':
        return <Edit className="h-3 w-3" />
      case 'delete':
        return <Trash2 className="h-3 w-3" />
      default:
        return <Lock className="h-3 w-3" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Permisos de Usuario
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{user?.email}</span>
            <Badge className={getRoleColor('user')}>
              {getRoleText('user')}
            </Badge>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {modules.map((module) => {
            const modulePermissions = permissions[module.key as keyof typeof permissions]
            const hasAnyPermission = typeof modulePermissions === 'object' 
              ? Object.values(modulePermissions).some(p => p === true)
              : false

            if (!hasAnyPermission) {
              return (
                <div key={module.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-50">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{module.icon}</span>
                    <span className="font-medium text-gray-500">{module.name}</span>
                  </div>
                  <Badge variant="outline" className="text-gray-500">
                    Sin acceso
                  </Badge>
                </div>
              )
            }

            return (
              <div key={module.key} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{module.icon}</span>
                    <span className="font-medium">{module.name}</span>
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    Acceso permitido
                  </Badge>
                </div>
                
                {typeof modulePermissions === 'object' && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(modulePermissions).map(([action, allowed]) => (
                      allowed && (
                        <Badge 
                          key={action} 
                          variant="secondary" 
                          className="text-xs flex items-center gap-1"
                        >
                          {getPermissionIcon(action)}
                          {action === 'read' && 'Ver'}
                          {action === 'create' && 'Crear'}
                          {action === 'update' && 'Editar'}
                          {action === 'delete' && 'Eliminar'}
                          {action === 'viewInternal' && 'Ver internos'}
                          {action === 'addComments' && 'Comentar'}
                        </Badge>
                      )
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
