'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Navigation } from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus, Search, Edit, Trash2, Mail, Phone, Building } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'

interface Employee {
  id: string
  name: string
  email: string
  phone: string | null
  department: string | null
  position: string | null
  created_at: string
  updated_at: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name')

      if (error) throw error
      if (data) setEmployees(data)
    } catch (error) {
      console.error('Error fetching employees:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los empleados',
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
        phone: formData.phone || null,
        department: formData.department || null,
        position: formData.position || null,
        updated_at: new Date().toISOString(),
      }

      if (editingEmployee) {
        await supabase
          .from('employees')
          .update(data)
          .eq('id', editingEmployee.id)
      } else {
        await supabase.from('employees').insert([{
          ...data,
          created_at: new Date().toISOString(),
        }])
      }

      await fetchEmployees()
      setIsDialogOpen(false)
      setEditingEmployee(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
      })

      toast({
        title: 'Éxito',
        description: editingEmployee ? 'Empleado actualizado' : 'Empleado creado',
      })
    } catch (error) {
      console.error('Error saving employee:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar el empleado',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      department: employee.department || '',
      position: employee.position || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        await supabase.from('employees').delete().eq('id', id)
        await fetchEmployees()
        toast({
          title: 'Éxito',
          description: 'Empleado eliminado',
        })
      } catch (error) {
        console.error('Error deleting employee:', error)
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el empleado',
          variant: 'destructive',
        })
      }
    }
  }

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Navigation />
        <div className="flex-1 md:ml-64">
          <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
                <p className="text-gray-600">Gestión de empleados de la empresa</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingEmployee(null)
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      department: '',
                      position: '',
                    })
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Empleado
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingEmployee ? 'Editar Empleado' : 'Nuevo Empleado'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingEmployee ? 'Modifica los datos del empleado' : 'Agrega un nuevo empleado'}
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
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Departamento</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Cargo</Label>
                      <Input
                        id="position"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
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
                        {loading ? 'Guardando...' : editingEmployee ? 'Actualizar' : 'Crear'}
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
                  placeholder="Buscar empleados..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{employee.name}</CardTitle>
                    <CardDescription>
                      {employee.position} {employee.department && `- ${employee.department}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{employee.email}</span>
                      </div>
                      {employee.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{employee.phone}</span>
                        </div>
                      )}
                      {employee.department && (
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span>{employee.department}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredEmployees.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron empleados</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
