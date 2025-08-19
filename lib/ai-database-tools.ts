import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export interface DatabaseQueryResult {
  success: boolean
  data?: any
  error?: string
}

// Consultar tickets
export async function getTickets(filters?: {
  status?: string
  priority?: string
  assigned_to?: string
  limit?: number
}): Promise<DatabaseQueryResult> {
  try {
    let query = supabase
      .from("tickets")
      .select(`
        *,
        assigned_employee:employees(name, email, department),
        created_by_employee:employees!tickets_created_by_fkey(name, email)
      `)
      .order("created_at", { ascending: false })

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }
    if (filters?.priority) {
      query = query.eq("priority", filters.priority)
    }
    if (filters?.assigned_to) {
      query = query.eq("assigned_to", filters.assigned_to)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Consultar empleados
export async function getEmployees(filters?: {
  department?: string
  active?: boolean
  limit?: number
}): Promise<DatabaseQueryResult> {
  try {
    let query = supabase.from("employees").select("*").order("name")

    if (filters?.department) {
      query = query.eq("department", filters.department)
    }
    if (filters?.active !== undefined) {
      query = query.eq("active", filters.active)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Consultar equipos
export async function getEquipment(filters?: {
  status?: string
  type?: string
  assigned_to?: string
  limit?: number
}): Promise<DatabaseQueryResult> {
  try {
    let query = supabase
      .from("equipment")
      .select(`
        *,
        equipment_type:equipment_types(name, category),
        assigned_employee:employees(name, email, department),
        service_station:service_stations(name, location)
      `)
      .order("created_at", { ascending: false })

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }
    if (filters?.type) {
      query = query.eq("equipment_type_id", filters.type)
    }
    if (filters?.assigned_to) {
      query = query.eq("assigned_to", filters.assigned_to)
    }
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query

    if (error) throw error

    return { success: true, data }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Obtener estadísticas generales
export async function getSystemStats(): Promise<DatabaseQueryResult> {
  try {
    const [ticketsResult, employeesResult, equipmentResult] = await Promise.all([
      supabase.from("tickets").select("status", { count: "exact" }),
      supabase.from("employees").select("active", { count: "exact" }),
      supabase.from("equipment").select("status", { count: "exact" }),
    ])

    const ticketStats = await supabase
      .from("tickets")
      .select("status")
      .then(({ data }) => {
        const stats = { open: 0, in_progress: 0, resolved: 0, closed: 0 }
        data?.forEach((ticket) => {
          if (ticket.status in stats) {
            stats[ticket.status as keyof typeof stats]++
          }
        })
        return stats
      })

    const equipmentStats = await supabase
      .from("equipment")
      .select("status")
      .then(({ data }) => {
        const stats = { available: 0, assigned: 0, maintenance: 0, retired: 0 }
        data?.forEach((equipment) => {
          if (equipment.status in stats) {
            stats[equipment.status as keyof typeof stats]++
          }
        })
        return stats
      })

    const activeEmployees = await supabase.from("employees").select("id", { count: "exact" }).eq("active", true)

    return {
      success: true,
      data: {
        tickets: {
          total: ticketsResult.count || 0,
          by_status: await ticketStats,
        },
        employees: {
          total: employeesResult.count || 0,
          active: activeEmployees.count || 0,
        },
        equipment: {
          total: equipmentResult.count || 0,
          by_status: await equipmentStats,
        },
      },
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

// Buscar información específica
export async function searchInformation(
  query: string,
  type?: "tickets" | "employees" | "equipment",
): Promise<DatabaseQueryResult> {
  try {
    const results: any = {}

    if (!type || type === "tickets") {
      const { data: tickets } = await supabase
        .from("tickets")
        .select(`
          *,
          assigned_employee:employees(name, email),
          created_by_employee:employees!tickets_created_by_fkey(name, email)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10)

      results.tickets = tickets || []
    }

    if (!type || type === "employees") {
      const { data: employees } = await supabase
        .from("employees")
        .select("*")
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,department.ilike.%${query}%`)
        .limit(10)

      results.employees = employees || []
    }

    if (!type || type === "equipment") {
      const { data: equipment } = await supabase
        .from("equipment")
        .select(`
          *,
          equipment_type:equipment_types(name, category),
          assigned_employee:employees(name, email)
        `)
        .or(`name.ilike.%${query}%,serial_number.ilike.%${query}%,model.ilike.%${query}%`)
        .limit(10)

      results.equipment = equipment || []
    }

    return { success: true, data: results }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
