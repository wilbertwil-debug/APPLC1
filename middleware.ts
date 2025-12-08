import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
          },
        },
      },
    )

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    console.log("🔍 Middleware session check:", {
      path: req.nextUrl.pathname,
      hasSession: !!session,
      user: session?.user?.email || "none",
      error: error?.message || "none",
      cookies: req.cookies
        .getAll()
        .map((c) => c.name)
        .join(", "),
    })

    const protectedRoutes = [
      "/dashboard",
      "/equipment",
      "/employees",
      "/users",
      "/tickets",
      "/ai-assistant",
      "/equipment-types",
      "/service-stations",
    ]

    const isProtectedRoute = protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))

    if (!session && isProtectedRoute) {
      console.log("⚠️ Would redirect to login from:", req.nextUrl.pathname)
      // return NextResponse.redirect(new URL('/login', req.url))
    }

    if (session && req.nextUrl.pathname === "/login") {
      console.log("✅ Session exists, redirecting from login to dashboard")
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    console.log("✅ Middleware allowing access to:", req.nextUrl.pathname)
    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/equipment/:path*",
    "/employees/:path*",
    "/users/:path*",
    "/tickets/:path*",
    "/ai-assistant/:path*",
    "/equipment-types/:path*",
    "/service-stations/:path*",
    "/login",
  ],
}
