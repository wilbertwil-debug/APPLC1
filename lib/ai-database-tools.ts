import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export interface DatabaseQueryResult {
  success: boolean
  data?: any
  error?: string
}

export async function getProducts(filters?: {
  category?: string
  supplier?: string
  low_stock?: boolean
  limit?: number
}): Promise<DatabaseQueryResult> {
  try {
    let query = supabase
      .from("products")
      .select(`
        *,
        categories(name),
        suppliers(name, contact_person)
      `)
      .order("created_at", { ascending: false })

    if (filters?.category) {
      query = query.eq("category_id", filters.category)
    }
    if (filters?.supplier) {
      query = query.eq("supplier_id", filters.supplier)
    }
    if (filters?.low_stock) {
      query = query.lt("stock_quantity", 10)
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

export async function getEmployees(filters?: {
  user_type?: string
  active?: boolean
  limit?: number
}): Promise<DatabaseQueryResult> {
  try {
    let query = supabase.from("employees").select("*").order("name")

    if (filters?.user_type) {
      query = query.eq("user_type", filters.user_type)
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

export async function getSuppliers(filters?: {
  active?: boolean
  limit?: number
}): Promise<DatabaseQueryResult> {
  try {
    let query = supabase.from("suppliers").select("*").order("name")

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

export async function getCategories(filters?: {
  limit?: number
}): Promise<DatabaseQueryResult> {
  try {
    let query = supabase.from("categories").select("*").order("name")

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

export async function getSystemStats(): Promise<DatabaseQueryResult> {
  try {
    const [productsResult, employeesResult, suppliersResult, categoriesResult] = await Promise.all([
      supabase.from("products").select("*", { count: "exact" }),
      supabase.from("employees").select("*", { count: "exact" }),
      supabase.from("suppliers").select("*", { count: "exact" }),
      supabase.from("categories").select("*", { count: "exact" }),
    ])

    // Get low stock products
    const lowStockProducts = await supabase.from("products").select("*", { count: "exact" }).lt("stock_quantity", 10)

    // Get products by category
    const productsByCategory = await supabase
      .from("products")
      .select(`
        categories(name),
        stock_quantity
      `)
      .then(({ data }) => {
        const stats: Record<string, { count: number; total_stock: number }> = {}
        data?.forEach((product) => {
          const categoryName = product.categories?.name || "Sin categoría"
          if (!stats[categoryName]) {
            stats[categoryName] = { count: 0, total_stock: 0 }
          }
          stats[categoryName].count++
          stats[categoryName].total_stock += product.stock_quantity || 0
        })
        return stats
      })

    // Get active suppliers
    const activeSuppliers = await supabase.from("suppliers").select("*", { count: "exact" }).eq("active", true)

    return {
      success: true,
      data: {
        products: {
          total: productsResult.count || 0,
          low_stock: lowStockProducts.count || 0,
          by_category: await productsByCategory,
        },
        employees: {
          total: employeesResult.count || 0,
        },
        suppliers: {
          total: suppliersResult.count || 0,
          active: activeSuppliers.count || 0,
        },
        categories: {
          total: categoriesResult.count || 0,
        },
      },
    }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}

export async function searchInformation(
  query: string,
  type?: "products" | "employees" | "suppliers" | "categories",
): Promise<DatabaseQueryResult> {
  try {
    const results: any = {}

    if (!type || type === "products") {
      const { data: products } = await supabase
        .from("products")
        .select(`
          *,
          categories(name),
          suppliers(name, contact_person)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`)
        .limit(10)

      results.products = products || []
    }

    if (!type || type === "employees") {
      const { data: employees } = await supabase
        .from("employees")
        .select("*")
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,position.ilike.%${query}%`)
        .limit(10)

      results.employees = employees || []
    }

    if (!type || type === "suppliers") {
      const { data: suppliers } = await supabase
        .from("suppliers")
        .select("*")
        .or(`name.ilike.%${query}%,contact_person.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10)

      results.suppliers = suppliers || []
    }

    if (!type || type === "categories") {
      const { data: categories } = await supabase.from("categories").select("*").ilike("name", `%${query}%`).limit(10)

      results.categories = categories || []
    }

    return { success: true, data: results }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
}
