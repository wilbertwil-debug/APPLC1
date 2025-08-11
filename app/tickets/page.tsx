'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Edit, Trash2, Clock, User, Calendar, MessageSquare } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'
import { TicketTrackingDialog } from '@/components/ticket-tracking-dialog'
import { TicketCommentsSummary } from '@/components/ticket-comments-summary'
import { usePermissions } from '@/contexts/permissions-context'

interface Ticket {
  id: string
  title: string
  description: string
  priority: string
  status: string
  created_by: string | null
  assigned_to: string | null
  equipment_id: string | null
  service_station_id: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
  observations: string | null
  created_by_employee?: { name: string }
  assigned_to_employee?: { name: string }
  equipment?: { name: string }
  service_stations?: { name: string }
}

interface Employee {
  id: string
  name: string
}

interface Equipment {
  id: string
  name: string
}

interface ServiceStation {
  id: string
  name: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [serviceStations, setServiceStations] = useState<ServiceStation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null)
  const { toast } = useToast()
  const { hasPermission } = usePermissions()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    created_by: '',
    assigned_to: '',
    equipment_id: '',
    service_station_id: '',
    observations: '',
  })

  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [selectedTicketForTracking, setSelectedTicketForTracking] = useState<Ticket | null>(null)

  // Permisos
  const canCreate = hasPermission('tickets', 'create')
  const canUpdate = hasPermission('tickets', 'update')
  const canDelete = hasPermission('tickets', 'delete')
  const canViewInternal = hasPermission('tickets', 'viewInternal')
  const canAddComments = hasPermission('tickets', 'addComments')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ticketsRes, employeesRes, equipmentRes, stationsRes] = await Promise.all([
        supabase
          .from('tickets')
          .select(`
            *,
            created_by_employee:employees!tickets_created_by_fkey(name),
            assigned_to_employee:employees!tickets_assigned_to_fkey(name),
            equipment(name),
            service_stations(name)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('employees').select('*'),
        supabase.from('equipment').select('*'),
        supabase.from('service_stations').select('*'),
      ])

      if (ticketsRes.data) setTickets(ticketsRes.data)
      if (employeesRes.data) setEmployees(employeesRes.data)
      if (equipmentRes.data) setEquipment(equipmentRes.data)
      if (stationsRes.data) setServiceStations(stationsRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canCreate && !canUpdate) {
      toast({
        title: 'Sin permisos',
        description: 'No tienes permisos para realizar esta acción',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const data = {
        ...formData,
        created_by: formData.created_by || null,
        assigned_to: formData.assigned_to || null,
        equipment_id: formData.equipment_id || null,
        service_station_id: formData.service_station_id || null,
        updated_at: new Date().toISOString(),
        ...(formData.status === 'closed' && !editingTicket?.closed_at ? { closed_at: new Date().toISOString() } : {}),
        ...(formData.status !== 'closed' && editingTicket?.closed_at ? { closed_at: null } : {}),
      }

      if (editingTicket) {
        await supabase
          .from('tickets')
          .update(data)
          .eq('id', editingTicket.id)
      } else {
        await supabase.from('tickets').insert([{
          ...data,
          created_at: new Date().toISOString(),
        }])
      }

      await fetchData()
      setIsDialogOpen(false)
      setEditingTicket(null)
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        created_by: '',
        assigned_to: '',
        equipment_id: '',
        service_station_id: '',
        observations: '',
      })

      toast({
        title: 'Éxito',
        description: editingTicket ? 'Ticket actualizado' : 'Ticket creado',
      })
    } catch (error) {
      console.error('Error saving ticket:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar el ticket',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: Ticket) => {
    if (!canUpdate) {
      toast({
        title: 'Sin permisos',
        description: 'No tienes permisos para editar tickets',
        variant: 'destructive',
      })
      return
    }

    setEditingTicket(item)
    setFormData({
      title: item.title,
      description: item.description,
      priority: item.priority,
      status: item.status,
      created_by: item.created_by || '',
      assigned_to: item.assigned_to || '',
      equipment_id: item.equipment_id || '',
      service_station_id: item.service_station_id || '',
      observations: item.observations || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      toast({
        title: 'Sin permisos',
        description: 'No tienes permisos para eliminar tickets',
        variant: 'destructive',
      })
      return
    }

    if (confirm('¿Estás seguro de que quieres eliminar este ticket?')) {
      try {
        await supabase.from('tickets').delete().eq('id', id)
        await fetchData()
        toast({
          title: 'Éxito',
          description: 'Ticket eliminado',
        })
      } catch (error) {
        console.error('Error deleting ticket:', error)
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el ticket',
          variant: 'destructive',
        })
      }
    }
  }

  const filteredTickets = tickets.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.created_by_employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assigned_to_employee?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-orange-100 text-orange-800'
      case 'closed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta'
      case 'medium':
        return 'Media'
      case 'low':
        return 'Baja'
      default:
        return priority
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open':
        return 'Abierto'
      case 'in_progress':
        return 'En Progreso'
      case 'closed':
        return 'Cerrado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleOpenTracking = (ticket: Ticket) => {
    setSelectedTicketForTracking(ticket)
    setTrackingDialogOpen(true)
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Navigation />
        <div className="flex-1 md:ml-64">
          <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tickets - Mesa de Ayuda</h1>
                <p className="text-gray-600">Gestión de tickets de soporte técnico</p>
              </div>
              {canCreate && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingTicket(null)
                      setFormData({
                        title: '',
                        description: '',
                        priority: 'medium',
                        status: 'open',
                        created_by: '',
                        assigned_to: '',
                        equipment_id: '',
                        service_station_id: '',
                        observations: '',
                      })
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingTicket ? 'Editar Ticket' : 'Nuevo Ticket'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingTicket ? 'Modifica los datos del ticket' : 'Crea un nuevo ticket de soporte'}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="priority">Prioridad</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value) => setFormData({ ...formData, priority: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baja</SelectItem>
                              <SelectItem value="medium">Media</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {canUpdate && (
                          <div className="space-y-2">
                            <Label htmlFor="status">Estado</Label>
                            <Select
                              value={formData.status}
                              onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="open">Abierto</SelectItem>
                                <SelectItem value="in_progress">En Progreso</SelectItem>
                                <SelectItem value="closed">Cerrado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="created_by">Creado por</Label>
                          <Select
                            value={formData.created_by}
                            onValueChange={(value) => setFormData({ ...formData, created_by: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar empleado" />
                            </SelectTrigger>
                            <SelectContent>
                              {employees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {canUpdate && (
                          <div className="space-y-2">
                            <Label htmlFor="assigned_to">Asignado a</Label>
                            <Select
                              value={formData.assigned_to}
                              onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar empleado" />
                              </SelectTrigger>
                              <SelectContent>
                                {employees.map((employee) => (
                                  <SelectItem key={employee.id} value={employee.id}>
                                    {employee.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <div className="space-y-2">
                          <Label htmlFor="equipment_id">Equipo Relacionado</Label>
                          <Select
                            value={formData.equipment_id}
                            onValueChange={(value) => setFormData({ ...formData, equipment_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar equipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {equipment.map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="service_station_id">Estación de Servicio</Label>
                          <Select
                            value={formData.service_station_id}
                            onValueChange={(value) => setFormData({ ...formData, service_station_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estación" />
                            </SelectTrigger>
                            <SelectContent>
                              {serviceStations.map((station) => (
                                <SelectItem key={station.id} value={station.id}>
                                  {station.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="observations">Observaciones</Label>
                        <Textarea
                          id="observations"
                          value={formData.observations}
                          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                          rows={3}
                          placeholder="Observaciones adicionales, notas de seguimiento..."
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'Guardando...' : editingTicket ? 'Actualizar' : 'Crear'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="h-fit">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{ticket.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {ticket.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {getPriorityText(ticket.priority)}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusText(ticket.status)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Creado:</span>
                        <span>{formatDate(ticket.created_at)}</span>
                      </div>

                      {ticket.created_by_employee && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Creado por:</span>
                          <span>{ticket.created_by_employee.name}</span>
                        </div>
                      )}

                      {ticket.assigned_to_employee && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-400" />
                          <span className="text-gray-600">Asignado a:</span>
                          <span className="font-medium">{ticket.assigned_to_employee.name}</span>
                        </div>
                      )}

                      {ticket.equipment && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Equipo:</span>
                          <span>{ticket.equipment.name}</span>
                        </div>
                      )}

                      {ticket.service_stations && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Estación:</span>
                          <span>{ticket.service_stations.name}</span>
                        </div>
                      )}

                      {ticket.closed_at && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-400" />
                          <span className="text-gray-600">Cerrado:</span>
                          <span>{formatDate(ticket.closed_at)}</span>
                        </div>
                      )}

                      {ticket.observations && (
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <span className="text-gray-600 text-xs font-medium">Observaciones:</span>
                          <p className="text-xs mt-1 line-clamp-3">{ticket.observations}</p>
                        </div>
                      )}
                    </div>

                    {/* Resumen de comentarios */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <TicketCommentsSummary ticketId={ticket.id} />
                    </div>

                    <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenTracking(ticket)}
                        title="Ver seguimiento y comentarios"
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span className="hidden sm:inline">Seguimiento</span>
                      </Button>
                      {canUpdate && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(ticket)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(ticket.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTickets.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron tickets</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <TicketTrackingDialog
        open={trackingDialogOpen}
        onOpenChange={setTrackingDialogOpen}
        ticketId={selectedTicketForTracking?.id || ''}
        ticketTitle={selectedTicketForTracking?.title || ''}
        canAddComments={canAddComments}
        canViewInternal={canViewInternal}
      />
    </ProtectedRoute>
  )
}
