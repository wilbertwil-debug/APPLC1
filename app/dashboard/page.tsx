'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navigation } from '@/components/navigation'
import { ProtectedRoute } from '@/components/protected-route'
import { Monitor, Users, UserCheck, Ticket, AlertTriangle, CheckCircle } from 'lucide-react'

interface DashboardStats {
  totalEquipment: number
  totalEmployees: number
  totalUsers: number
  openTickets: number
  availableEquipment: number
  assignedEquipment: number
}

function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEquipment: 0,
    totalEmployees: 0,
    totalUsers: 0,
    openTickets: 0,
    availableEquipment: 0,
    assignedEquipment: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [
        { count: equipmentCount },
        { count: employeeCount },
        { count: userCount },
        { count: openTicketCount },
        { count: availableEquipmentCount },
        { count: assignedEquipmentCount },
      ] = await Promise.all([
        supabase.from('equipment').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'open'),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('equipment').select('*', { count: 'exact', head: true }).eq('status', 'assigned'),
      ])

      setStats({
        totalEquipment: equipmentCount || 0,
        totalEmployees: employeeCount || 0,
        totalUsers: userCount || 0,
        openTickets: openTicketCount || 0,
        availableEquipment: availableEquipmentCount || 0,
        assignedEquipment: assignedEquipmentCount || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Equipos',
      value: stats.totalEquipment,
      description: 'Equipos registrados',
      icon: Monitor,
      color: 'text-blue-600',
    },
    {
      title: 'Empleados',
      value: stats.totalEmployees,
      description: 'Empleados activos',
      icon: Users,
      color: 'text-green-600',
    },
    {
      title: 'Usuarios',
      value: stats.totalUsers,
      description: 'Usuarios del sistema',
      icon: UserCheck,
      color: 'text-purple-600',
    },
    {
      title: 'Tickets Abiertos',
      value: stats.openTickets,
      description: 'Tickets pendientes',
      icon: Ticket,
      color: 'text-red-600',
    },
    {
      title: 'Equipos Disponibles',
      value: stats.availableEquipment,
      description: 'Listos para asignar',
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Equipos Asignados',
      value: stats.assignedEquipment,
      description: 'En uso actualmente',
      icon: AlertTriangle,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Resumen del sistema de inventario</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? '...' : card.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
                <CardDescription>
                  Últimas acciones en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nuevo equipo registrado</p>
                      <p className="text-xs text-gray-500">Hace 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Ticket resuelto</p>
                      <p className="text-xs text-gray-500">Hace 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Equipo asignado</p>
                      <p className="text-xs text-gray-500">Hace 6 horas</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Equipos</CardTitle>
                <CardDescription>
                  Distribución por estado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disponibles</span>
                    <span className="text-sm font-medium text-green-600">
                      {stats.availableEquipment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Asignados</span>
                    <span className="text-sm font-medium text-orange-600">
                      {stats.assignedEquipment}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">En Mantenimiento</span>
                    <span className="text-sm font-medium text-red-600">
                      {stats.totalEquipment - stats.availableEquipment - stats.assignedEquipment}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
