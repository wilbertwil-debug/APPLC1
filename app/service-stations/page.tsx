'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Edit, Trash2, MapPin } from 'lucide-react'

interface ServiceStation {
  id: string
  name: string
  location: string | null
  description: string | null
  created_at: string
}

export default function ServiceStationsPage() {
  const [serviceStations, setServiceStations] = useState<ServiceStation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStation, setEditingStation] = useState<ServiceStation | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
  })

  useEffect(() => {
    fetchServiceStations()
  }, [])

  const fetchServiceStations = async () => {
    try {
      const { data, error } = await supabase
        .from('service_stations')
        .select('*')
        .order('name')

      if (error) throw error
      if (data) setServiceStations(data)
    } catch (error) {
      console.error('Error fetching service stations:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las estaciones de servicio',
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
        location: formData.location || null,
        description: formData.description || null,
      }

      if (editingStation) {
        await supabase
          .from('service_stations')
          .update(data)
          .eq('id', editingStation.id)
      } else {
        await supabase.from('service_stations').insert([{
          ...data,
          created_at: new Date().toISOString(),
        }])
      }

      await fetchServiceStations()
      setIsDialogOpen(false)
      setEditingStation(null)
      setFormData({
        name: '',
        location: '',
        description: '',
      })

      toast({
        title: 'Éxito',
        description: editingStation ? 'Estación de servicio actualizada' : 'Estación de servicio creada',
      })
    } catch (error) {
      console.error('Error saving service station:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar la estación de servicio',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (station: ServiceStation) => {
    setEditingStation(station)
    setFormData({
      name: station.name,
      location: station.location || '',
      description: station.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta estación de servicio?')) {
      try {
        await supabase.from('service_stations').delete().eq('id', id)
        await fetchServiceStations()
        toast({
          title: 'Éxito',
          description: 'Estación de servicio eliminada',
        })
      } catch (error) {
        console.error('Error deleting service station:', error)
        toast({
          title: 'Error',
          description: 'No se pudo eliminar la estación de servicio',
          variant: 'destructive',
        })
      }
    }
  }

  const filteredStations = serviceStations.filter(station =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Estaciones de Servicio</h1>
              <p className="text-gray-600">Gestión de ubicaciones de soporte técnico</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingStation(null)
                  setFormData({
                    name: '',
                    location: '',
                    description: '',
                  })
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Estación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingStation ? 'Editar Estación de Servicio' : 'Nueva Estación de Servicio'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStation ? 'Modifica los datos de la estación' : 'Agrega una nueva estación de servicio'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="location">Ubicación</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Ej: Piso 2, Edificio A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="Descripción de la estación y servicios que ofrece"
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
                      {loading ? 'Guardando...' : editingStation ? 'Actualizar' : 'Crear'}
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
                placeholder="Buscar estaciones de servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station) => (
              <Card key={station.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-lg">{station.name}</CardTitle>
                    </div>
                  </div>
                  {station.location && (
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {station.location}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {station.description && (
                    <p className="text-sm text-gray-600 mb-4">{station.description}</p>
                  )}
                  <div className="text-xs text-gray-500 mb-4">
                    Creado: {new Date(station.created_at).toLocaleDateString('es-ES')}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(station)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(station.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStations.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron estaciones de servicio</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
