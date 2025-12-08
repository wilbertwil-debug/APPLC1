import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log("[v0] Supabase URL:", supabaseUrl ? "✓ Set" : "✗ Missing")
  console.log("[v0] Supabase Anon Key:", supabaseAnonKey ? "✓ Set" : "✗ Missing")

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Missing Supabase configuration")
    return null
  }

  try {
    const client = createBrowserClient(supabaseUrl, supabaseAnonKey)
    console.log("[v0] Supabase client created successfully")
    return client
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return null
  }
}

export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get: (target, prop) => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.",
      )
    }

    if (!supabaseInstance) {
      try {
        supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
        console.log("[v0] Supabase instance initialized on first access")
      } catch (error) {
        console.error("[v0] Failed to initialize Supabase instance:", error)
        throw error
      }
    }

    return (supabaseInstance as any)[prop]
  },
})

export const isSupabaseConfigured = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(supabaseUrl && supabaseAnonKey)
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          department: string | null
          position: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          department?: string | null
          position?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          department?: string | null
          position?: string | null
          updated_at?: string
        }
      }
      equipment_types: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
        }
      }
      service_stations: {
        Row: {
          id: string
          name: string
          location: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          location?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string | null
          description?: string | null
        }
      }
      equipment: {
        Row: {
          id: string
          name: string
          model: string | null
          brand: string | null
          serial_number: string | null
          equipment_type_id: string | null
          assigned_to: string | null
          service_station_id: string | null
          status: string
          purchase_date: string | null
          warranty_expiry: string | null
          specifications: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          model?: string | null
          brand?: string | null
          serial_number?: string | null
          equipment_type_id?: string | null
          assigned_to?: string | null
          service_station_id?: string | null
          status?: string
          purchase_date?: string | null
          warranty_expiry?: string | null
          specifications?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          model?: string | null
          brand?: string | null
          serial_number?: string | null
          equipment_type_id?: string | null
          assigned_to?: string | null
          service_station_id?: string | null
          status?: string
          purchase_date?: string | null
          warranty_expiry?: string | null
          specifications?: any | null
          updated_at?: string
        }
      }
      tickets: {
        Row: {
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
        }
        Insert: {
          id?: string
          title: string
          description: string
          priority?: string
          status?: string
          created_by?: string | null
          assigned_to?: string | null
          equipment_id?: string | null
          service_station_id?: string | null
          created_at?: string
          updated_at?: string
          closed_at?: string | null
          observations?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          priority?: string
          status?: string
          assigned_to?: string | null
          equipment_id?: string | null
          service_station_id?: string | null
          updated_at?: string
          closed_at?: string | null
          observations?: string | null
        }
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          author_id: string | null
          comment: string
          comment_type: string
          is_internal: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          author_id?: string | null
          comment: string
          comment_type?: string
          is_internal?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          author_id?: string | null
          comment?: string
          comment_type?: string
          is_internal?: boolean
          updated_at?: string
        }
      }
      employee_files: {
        Row: {
          id: string
          employee_id: string
          file_name: string
          file_type: string
          file_size: number
          upload_date: string
          uploaded_by: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          file_name: string
          file_type: string
          file_size: number
          upload_date?: string
          uploaded_by?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          file_name?: string
          file_type?: string
          file_size?: number
          upload_date?: string
          uploaded_by?: string | null
          description?: string | null
          updated_at?: string
        }
      }
    }
  }
}
