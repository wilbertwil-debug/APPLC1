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
import { Plus, Search, Edit, Trash2, Mail, Shield } from 'lucide-react'
import { ProtectedRoute } from '@/components/protected-route'

interface User {
  id: string
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('name')

      if (error) throw error
      if (data) setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
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
        updated_at: new Date().toISOString(),
      }

      if (editingUser) {
        await supabase
          .from('users')
          .update(data)
          .eq('id', editingUser.id)
      } else {
        await supabase.from('users').insert([{
          ...data,
          created_at: new Date().toISOString(),
        }])
      }

      await fetchUsers()
      setIsDialogOpen(false)
      setEditingUser(null)
      setFormData({
        name: '',
        email: '',
        role: 'user',
      })

      toast({
        title: 'Éxito',
        description: editingUser ? 'Usuario actualizado' : 'Usuario creado',
      })
    } catch (error) {
      console.error('Error saving user:', error)
      toast({
        title: 'Error',
        description: 'No se pudo guardar el usuario',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await supabase.from('users').delete().eq('id', id)
        await fetchUsers()
        toast({
          title: 'Éxito',
          description: 'Usuario eliminado',
        })
      } catch (error) {
        console.error('Error deleting user:', error)
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el usuario',
          variant: 'destructive',
        })
      }
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        <Navigation />
        <div className="flex-1 md:ml-64">
          <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
                <p className="text-gray-600">Gestión de usuarios del sistema</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingUser(null)
                    setFormData({
                      name: '',
                      email: '',
                      role: 'user',
                    })
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingUser ? 'Modifica los datos del usuario' : 'Agrega un nuevo usuario al sistema'}
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
                      <Label htmlFor="role">Rol</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Usuario</SelectItem>
                          <SelectItem value="manager">Gerente</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
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
                        {loading ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear'}
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
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4" />
                          {user.email}
                        </CardDescription>
                      </div>
                      <Badge className={getRoleColor(user.role)}>
                        {getRoleText(user.role)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Rol:</span>
                        <span>{getRoleText(user.role)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Creado: {new Date(user.created_at).toLocaleDateString('es-ES')}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron usuarios</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
