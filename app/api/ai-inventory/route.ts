import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { query, table } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    let data = null
    let error = null

    switch (table?.toLowerCase()) {
      case "products":
      case "productos":
        ;({ data, error } = await supabase.from("products").select("*").ilike("name", `%${query}%`).limit(10))
        break

      case "employees":
      case "empleados":
        ;({ data, error } = await supabase
          .from("employees")
          .select("*")
          .or(`name.ilike.%${query}%,email.ilike.%${query}%,position.ilike.%${query}%`)
          .limit(10))
        break

      case "suppliers":
      case "proveedores":
        ;({ data, error } = await supabase
          .from("suppliers")
          .select("*")
          .or(`name.ilike.%${query}%,contact_person.ilike.%${query}%`)
          .limit(10))
        break

      case "categories":
      case "categorias":
        ;({ data, error } = await supabase.from("categories").select("*").ilike("name", `%${query}%`).limit(10))
        break

      case "inventory":
      case "inventario":
        ;({ data, error } = await supabase
          .from("products")
          .select(`
            *,
            categories (name),
            suppliers (name)
          `)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(10))
        break

      default:
        const [productsResult, employeesResult, suppliersResult] = await Promise.all([
          supabase.from("products").select("*").ilike("name", `%${query}%`).limit(5),
          supabase.from("employees").select("*").ilike("name", `%${query}%`).limit(5),
          supabase.from("suppliers").select("*").ilike("name", `%${query}%`).limit(5),
        ])

        data = {
          products: productsResult.data || [],
          employees: employeesResult.data || [],
          suppliers: suppliersResult.data || [],
        }
        break
    }

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Error querying database" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      query,
      table: table || "general",
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
