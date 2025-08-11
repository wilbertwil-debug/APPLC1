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
import { Plus, Search, Edit, Trash2, Settings } from 'lucide-react'

interface EquipmentType {
  id: string
  name: string
  description: string | null
  created_at: string
}

export default function EquipmentTypesPage() {
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingType, setEditingType] = useState<EquipmentType | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    fetchEquipmentTypes()
  }, [])

  const fetchEquipmentTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name')

      if (error) throw error
      if (data) setEquipmentTypes(data)
    } catch (error) {
      console.error('Error fetching equipment types:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los tipos de equipos',
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
        description: formData.description || null,
      }

      if (editingType) {
        await supabase
          .from('equipment_types')
          .update(data)
          .eq('id', editingType.id)
      } else {
        await supabase.from('equipment_types').insert([{
          ...data,
          created_at: new Date().toISOString(),
        }])
      }

      await fetchEquipmentTypes()
      setIsDialogOpen(false)
      setEditingType(null)
      setFormData({
        name: '',
        description: '',
      })

      toast({
        title: 'Éxito',
        description: editingType ? 'Tipo de equipo actualizado' : 'Tipo de equipo creado',
      })
    } catch (error) {
      console.error('Error saving equipment type:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar el tipo de equipo',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (type: EquipmentType) => {
    setEditingType(type)
    setFormData({
      name: type.name,
      description: type.description || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este tipo de equipo?')) {
      try {
        await supabase.from('equipment_types').delete().eq('id', id)
        await fetchEquipmentTypes()
        toast({
          title: 'Éxito',
          description: 'Tipo de equipo eliminado',
        })
      } catch (error) {
        console.error('Error deleting equipment type:', error)
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el tipo de equipo',
          variant: 'destructive',
        })
      }
    }
  }

  const filteredTypes = equipmentTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation />
      <div className="flex-1 md:ml-64">
        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tipos de Equipos</h1>
              <p className="text-gray-600">Gestión de categorías de equipos</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingType(null)
                  setFormData({
                    name: '',
                    description: '',
                  })
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingType ? 'Editar Tipo de Equipo' : 'Nuevo Tipo de Equipo'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingType ? 'Modifica los datos del tipo de equipo' : 'Agrega un nuevo tipo de equipo'}
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
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
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
                      {loading ? 'Guardando...' : editingType ? 'Actualizar' : 'Crear'}
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
                placeholder="Buscar tipos de equipos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTypes.map((type) => (
              <Card key={type.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{type.name}</CardTitle>
                    </div>
                  </div>
                  {type.description && (
                    <CardDescription>{type.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-500 mb-4">
                    Creado: {new Date(type.created_at).toLocaleDateString('es-ES')}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(type)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(type.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTypes.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron tipos de equipos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
