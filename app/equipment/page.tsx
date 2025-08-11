'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'

interface Equipment {
  id: string
  name: string
  model: string | null
  brand: string | null
  serial_number: string | null
  status: string
  equipment_type_id: string | null
  assigned_to: string | null
  service_station_id: string | null
  purchase_date: string | null
  warranty_expiry: string | null
  equipment_types?: { name: string }
  employees?: { name: string }
  service_stations?: { name: string }
}

interface EquipmentType {
  id: string
  name: string
}

interface Employee {
  id: string
  name: string
}

interface ServiceStation {
  id: string
  name: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [serviceStations, setServiceStations] = useState<ServiceStation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    model: '',
    brand: '',
    serial_number: '',
    status: 'available',
    equipment_type_id: '',
    assigned_to: '',
    service_station_id: '',
    purchase_date: '',
    warranty_expiry: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [equipmentRes, typesRes, employeesRes, stationsRes] = await Promise.all([
        supabase
          .from('equipment')
          .select(`
            *,
            equipment_types(name),
            employees(name),
            service_stations(name)
          `),
        supabase.from('equipment_types').select('*'),
        supabase.from('employees').select('*'),
        supabase.from('service_stations').select('*'),
      ])

      if (equipmentRes.data) setEquipment(equipmentRes.data)
      if (typesRes.data) setEquipmentTypes(typesRes.data)
      if (employeesRes.data) setEmployees(employeesRes.data)
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
    setLoading(true)

    try {
      const data = {
        ...formData,
        equipment_type_id: formData.equipment_type_id || null,
        assigned_to: formData.assigned_to || null,
        service_station_id: formData.service_station_id || null,
        purchase_date: formData.purchase_date || null,
        warranty_expiry: formData.warranty_expiry || null,
      }

      if (editingEquipment) {
        await supabase
          .from('equipment')
          .update(data)
          .eq('id', editingEquipment.id)
      } else {
        await supabase.from('equipment').insert([data])
      }

      await fetchData()
      setIsDialogOpen(false)
      setEditingEquipment(null)
      setFormData({
        name: '',
        model: '',
        brand: '',
        serial_number: '',
        status: 'available',
        equipment_type_id: '',
        assigned_to: '',
        service_station_id: '',
        purchase_date: '',
        warranty_expiry: '',
      })

      toast({
        title: 'Éxito',
        description: editingEquipment ? 'Equipo actualizado' : 'Equipo creado',
      })
    } catch (error) {
      console.error('Error saving equipment:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar el equipo',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item)
    setFormData({
      name: item.name,
      model: item.model || '',
      brand: item.brand || '',
      serial_number: item.serial_number || '',
      status: item.status,
      equipment_type_id: item.equipment_type_id || '',
      assigned_to: item.assigned_to || '',
      service_station_id: item.service_station_id || '',
      purchase_date: item.purchase_date || '',
      warranty_expiry: item.warranty_expiry || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
      try {
        await supabase.from('equipment').delete().eq('id', id)
        await fetchData()
        toast({
          title: 'Éxito',
          description: 'Equipo eliminado',
        })
      } catch (error) {
        console.error('Error deleting equipment:', error)
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el equipo',
          variant: 'destructive',
        })
      }
    }
  }

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'retired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible'
      case 'assigned':
        return 'Asignado'
      case 'maintenance':
        return 'Mantenimiento'
      case 'retired':
        return 'Retirado'
      default:
        return status
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Navigation />
        <div className="flex-1 md:ml-64">
          <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Equipos</h1>
                <p className="text-gray-600">Gestión de equipos tecnológicos</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingEquipment(null)
                    setFormData({
                      name: '',
                      model: '',
                      brand: '',
                      serial_number: '',
                      status: 'available',
                      equipment_type_id: '',
                      assigned_to: '',
                      service_station_id: '',
                      purchase_date: '',
                      warranty_expiry: '',
                    })
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Equipo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEquipment ? 'Editar Equipo' : 'Nuevo Equipo'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingEquipment ? 'Modifica los datos del equipo' : 'Agrega un nuevo equipo al inventario'}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Marca</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Modelo</Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="serial_number">Número de Serie</Label>
                        <Input
                          id="serial_number"
                          value={formData.serial_number}
                          onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="equipment_type_id">Tipo de Equipo</Label>
                        <Select
                          value={formData.equipment_type_id}
                          onValueChange={(value) => setFormData({ ...formData, equipment_type_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipmentTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                            <SelectItem value="available">Disponible</SelectItem>
                            <SelectItem value="assigned">Asignado</SelectItem>
                            <SelectItem value="maintenance">Mantenimiento</SelectItem>
                            <SelectItem value="retired">Retirado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
                      <div className="space-y-2">
                        <Label htmlFor="purchase_date">Fecha de Compra</Label>
                        <Input
                          id="purchase_date"
                          type="date"
                          value={formData.purchase_date}
                          onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="warranty_expiry">Vencimiento de Garantía</Label>
                        <Input
                          id="warranty_expiry"
                          type="date"
                          value={formData.warranty_expiry}
                          onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                        />
                      </div>
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
                        {loading ? 'Guardando...' : editingEquipment ? 'Actualizar' : 'Crear'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar equipos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        <CardDescription>
                          {item.brand} {item.model}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {item.serial_number && (
                        <p><span className="font-medium">S/N:</span> {item.serial_number}</p>
                      )}
                      {item.equipment_types && (
                        <p><span className="font-medium">Tipo:</span> {item.equipment_types.name}</p>
                      )}
                      {item.employees && (
                        <p><span className="font-medium">Asignado a:</span> {item.employees.name}</p>
                      )}
                      {item.service_stations && (
                        <p><span className="font-medium">Estación:</span> {item.service_stations.name}</p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEquipment.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron equipos</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
