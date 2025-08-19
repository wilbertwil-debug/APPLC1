"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Mail, Phone, Building, User, FileText, Printer, Monitor } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { EmployeeFilesDialog } from "@/components/employee-files-dialog"
import { SignaturePad } from "@/components/signature-pad"

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  status: string
  signature?: string
  email_policy_usage?: boolean
  technology_usage?: boolean
}

interface Equipment {
  equipment_type: string
  brand: string
  model: string
  specifications?: {
    android_version: string
    processor: string
    ram: string
    imei: string
  }
  serial_number: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [filesDialogOpen, setFilesDialogOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    status: "active",
    signature: "",
    email_policy_usage: false,
    technology_usage: false,
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("employees").select("*").order("name")

      if (error) throw error
      if (data) setEmployees(data)
    } catch (error) {
      console.error("Error fetching employees:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive",
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

      let result
      if (editingEmployee) {
        result = await supabase.from("employees").update(data).eq("id", editingEmployee.id)
      } else {
        result = await supabase.from("employees").insert([
          {
            ...data,
            created_at: new Date().toISOString(),
          },
        ])
      }

      if (result.error) {
        console.error("Supabase error:", result.error)
        throw new Error(result.error.message)
      }

      await fetchEmployees()
      setIsDialogOpen(false)
      setEditingEmployee(null)
      resetForm()

      toast({
        title: "Éxito",
        description: editingEmployee ? "Empleado actualizado" : "Empleado creado",
      })
    } catch (error) {
      console.error("Error saving employee:", error)
      toast({
        title: "Error",
        description: `No se pudo guardar el empleado: ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "",
      department: "",
      status: "active",
      signature: "",
      email_policy_usage: false,
      technology_usage: false,
    })
    setEditingEmployee(null)
  }

  const handleEdit = (employee: Employee) => {
    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      position: employee.position || "",
      department: employee.department || "",
      status: employee.status || "active",
      signature: employee.signature || "",
      email_policy_usage: employee.email_policy_usage || false,
      technology_usage: employee.technology_usage || false,
    })
    setEditingEmployee(employee)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este empleado?")) {
      try {
        await supabase.from("employees").delete().eq("id", id)
        await fetchEmployees()
        toast({
          title: "Éxito",
          description: "Empleado eliminado",
        })
      } catch (error) {
        console.error("Error deleting employee:", error)
        toast({
          title: "Error",
          description: "No se pudo eliminar el empleado",
          variant: "destructive",
        })
      }
    }
  }

  const handlePrintReport = async (employee: Employee) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Get equipment information for this employee
    let equipmentInfo = {
      type: "CELULAR",
      brand: "HONOR",
      model: "X6b",
      android_version: "ANDROID 14",
      processor: "MEDIATEK HELIO G85",
      ram: "6 GB",
      serial_number: "AM7XCP5414404697",
      imei: "868152074437708",
      accessories: "ADAPTADOR DE CORRIENTE Y CABLE USB-C, PROTECTORES DE USO RUDO",
    }

    try {
      const { data: equipment } = await supabase.from("equipment").select("*").eq("assigned_to", employee.id).single()

      if (equipment) {
        equipmentInfo = {
          type: equipment.equipment_type || "CELULAR",
          brand: equipment.brand || "HONOR",
          model: equipment.model || "X6b",
          android_version: equipment.specifications?.android_version || "ANDROID 14",
          processor: equipment.specifications?.processor || "MEDIATEK HELIO G85",
          ram: equipment.specifications?.ram || "6 GB",
          serial_number: equipment.serial_number || "AM7XCP5414404697",
          imei: equipment.specifications?.imei || "868152074437708",
          accessories:
            equipment.specifications?.accessories || "ADAPTADOR DE CORRIENTE Y CABLE USB-C, PROTECTORES DE USO RUDO",
        }
      }
    } catch (error) {
      console.log("Using default equipment info")
    }

    const reportContent = `
      <html>
        <head>
          <title>ENTREGA DE EQUIPOS DE TI - ${employee.name}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px;
              border: 2px solid #000;
              padding: 10px;
            }
            .logo { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 10px;
            }
            .form-info {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 10px;
              margin-bottom: 10px;
              font-size: 10px;
            }
            .title {
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
            }
            .date {
              text-align: right;
              margin-bottom: 20px;
            }
            .company-info {
              text-align: center;
              margin-bottom: 20px;
              font-weight: bold;
            }
            .equipment-info {
              margin-bottom: 20px;
            }
            .equipment-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 5px;
            }
            .conditions {
              margin: 20px 0;
            }
            .condition {
              margin-bottom: 10px;
              text-align: justify;
            }
            .signature-section {
              margin-top: 40px;
              text-align: center;
            }
            .signature-box {
              border: 1px solid #000;
              height: 80px;
              width: 300px;
              margin: 20px auto;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .signature-box img {
              max-width: 280px;
              max-height: 70px;
            }
            .signature-labels {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 50px;
              margin-top: 10px;
              text-align: center;
              border-top: 1px solid #000;
              padding-top: 5px;
              width: 300px;
              margin: 10px auto 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">LOPEZCASTRO</div>
            <div style="font-size: 14px; margin-bottom: 10px;">FORMATO</div>
            <div class="form-info">
              <div>TITULO: ENTREGA DE EQUIPOS DE TI</div>
              <div>CODIGO: FO-RSC-04</div>
              <div>PAGINA: 1</div>
            </div>
            <div class="form-info">
              <div>NUM. DE REVISION: 00</div>
              <div>FECHA DE EMISION: SEPTIEMBRE 2023</div>
              <div></div>
            </div>
          </div>

          <div class="date">
            <strong>Fecha: ${new Date().toLocaleDateString("es-ES")}</strong>
          </div>

          <div class="company-info">
            <div>RECIBI DE: CORPORATIVO LÓPEZ CASTRO</div>
            <div>AGENCIA ADUANAL</div>
            <div>LÓPEZ MOLINA S.C.P.</div>
          </div>

          <div class="equipment-info">
            <div class="equipment-row">
              <div><strong>TIPO DE EQUIPO:</strong> ${equipmentInfo.type}</div>
              <div><strong>MARCA:</strong> ${equipmentInfo.brand}</div>
            </div>
            <div class="equipment-row">
              <div><strong>MODELO:</strong> ${equipmentInfo.model}</div>
              <div><strong>VERSION DE ANDROID:</strong> ${equipmentInfo.android_version}</div>
            </div>
            <div class="equipment-row">
              <div><strong>PROCESADOR:</strong> ${equipmentInfo.processor}</div>
              <div><strong>RAM:</strong> ${equipmentInfo.ram}</div>
            </div>
            <div class="equipment-row">
              <div><strong>NUMERO SERIE:</strong> ${equipmentInfo.serial_number}</div>
              <div><strong>NUMERO DE IMEI:</strong> ${equipmentInfo.imei}</div>
            </div>
            <div style="margin-top: 10px;">
              <strong>ACCESORIOS:</strong> ${equipmentInfo.accessories}
            </div>
          </div>

          <div style="text-align: center; margin: 20px 0; font-weight: bold;">
            COMO HERRAMIENTA, LO CUAL CONSERVARÉ Y UTILIZARÉ EN EL PERIODO ESTABLECIDO<br>
            POR LA EMPRESA CUMPLIENDO LAS DISPOSICIONES SIGUIENTES.
          </div>

          <div class="conditions">
            <div class="condition">
              <strong>1.-</strong> EL EQUIPO CELULAR OTORGADO POR LA EMPRESA ES DE USO EXCLUSIVO PARA LA ACTIVIDAD QUE USTED DESEMPEÑA COMO PARTE DE ESTA.
            </div>
            <div class="condition">
              <strong>2.-</strong> CONSERVAR LOS ADITAMENTOS DE PROTECCIÓN ENTREGADOS POR LA EMPRESA EN TODO MOMENTO.
            </div>
            <div class="condition">
              <strong>3.-</strong> NOTIFICAR INMEDIATAMENTE CUALQUIER IRREGULARIDAD CON EL EQUIPO DE CELULAR AL DEPARTAMENTO DE GESTIÓN DE RECURSOS.
            </div>
            <div class="condition">
              <strong>4.-</strong> EN CASO DE EXTRAVÍO REPORTAR DE INMEDIATO AL DEPARTAMENTO DE GESTIÓN DE RECURSOS Y ASUMIRÁ LOS COSTOS POR LA REPOSICIÓN DEL EQUIPO.
            </div>
            <div class="condition">
              <strong>5.-</strong> EN CASO DE DAÑOS AL EQUIPO EL COLABORADOR DEBERÁ ENTREGARLO AL DEPARTAMENTO DE GESTIÓN DE RECURSOS PARA SU REPARACIÓN CON EL DISTRIBUIDOR AUTORIZADO Y ASUMIRÁ EL TOTAL DE LOS COSTOS.
            </div>
            <div class="condition">
              <strong>6.-</strong> EL EQUIPO DEBERÁ SER ENTREGADO AL DEPARTAMENTO DE GESTIÓN DE RECURSOS EN CUALQUIER MOMENTO CUANDO SE LE SOLICITE POR MOTIVO DE MANTENIMIENTO Y/O AUDITORIA.
            </div>
          </div>

          <div style="text-align: center; margin: 20px 0; font-weight: bold;">
            ASIMISMO, LOS ENTREGARÉ CUANDO TERMINE MI RELACIÓN LABORAL CON DICHA EMPRESA.
          </div>

          <div class="signature-section">
            <div><strong>Recibí:</strong></div>
            <div class="signature-box">
              ${employee.signature ? `<img src="${employee.signature}" alt="Firma del empleado" />` : ""}
            </div>
            <div class="signature-labels">
              <div>${employee.name}</div>
              <div>Firma</div>
            </div>
            <div class="signature-labels">
              <div>Nombre</div>
              <div></div>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(reportContent)
    printWindow.document.close()
    printWindow.print()
  }

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (employee.position && employee.position.toLowerCase().includes(searchTerm.toLowerCase())),
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
                <p className="text-gray-600">Gestión de empleados y expedientes</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingEmployee(null)
                      resetForm()
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Empleado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingEmployee ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
                    <DialogDescription>
                      {editingEmployee ? "Modifica los datos del empleado" : "Agrega un nuevo empleado al sistema"}
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
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="position">Posición</Label>
                        <Input
                          id="position"
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Input
                          id="status"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Políticas y Permisos</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="email_policy_usage"
                          checked={formData.email_policy_usage}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, email_policy_usage: checked as boolean })
                          }
                        />
                        <Label htmlFor="email_policy_usage">Política de Correo</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="technology_usage"
                          checked={formData.technology_usage}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, technology_usage: checked as boolean })
                          }
                        />
                        <Label htmlFor="technology_usage">Uso de Tecnología</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Firma Digital</Label>
                      <SignaturePad
                        initialSignature={formData.signature}
                        onSignatureChange={(signature) => setFormData({ ...formData, signature })}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading ? "Guardando..." : editingEmployee ? "Actualizar" : "Crear"}
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
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{employee.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4" />
                          {employee.email}
                        </CardDescription>
                      </div>
                      {employee.signature && (
                        <Badge variant="outline" className="text-green-600">
                          Firmado
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
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
                      {employee.position && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{employee.position}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span>Estado:</span>
                        <span>{employee.status}</span>
                      </div>

                      <div className="flex gap-2 mt-2">
                        {employee.email_policy_usage && (
                          <Badge variant="secondary" className="text-xs">
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Badge>
                        )}
                        {employee.technology_usage && (
                          <Badge variant="secondary" className="text-xs">
                            <Monitor className="w-3 h-3 mr-1" />
                            Tech
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between mt-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(employee)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(employee.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setFilesDialogOpen(true)
                          }}
                          title="Gestionar expediente"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePrintReport(employee)}
                          title="Imprimir reporte"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
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

      {selectedEmployee && (
        <EmployeeFilesDialog
          isOpen={filesDialogOpen}
          onClose={() => {
            setFilesDialogOpen(false)
            setSelectedEmployee(null)
          }}
          employeeId={selectedEmployee.id}
          employeeName={selectedEmployee.name}
        />
      )}
    </ProtectedRoute>
  )
}
