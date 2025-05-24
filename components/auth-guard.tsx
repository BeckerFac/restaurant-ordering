"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  type: "admin" | "superadmin"
}

export function AuthGuard({ children, type }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = () => {
      if (type === "admin") {
        const adminAuth = localStorage.getItem("adminAuthenticated") === "true"
        setIsAuthenticated(adminAuth)

        if (!adminAuth && !pathname.includes("/admin/login")) {
          router.push("/admin/login")
        }
      } else if (type === "superadmin") {
        const superadminAuth = localStorage.getItem("superadminAuthenticated") === "true"
        setIsAuthenticated(superadminAuth)

        if (!superadminAuth && !pathname.includes("/superadmin/login")) {
          router.push("/superadmin/login")
        }
      }

      setIsLoading(false)
    }

    checkAuth()

    // Escuchar eventos de actualización de datos
    const handleDataUpdate = () => {
      checkAuth()
    }

    window.addEventListener("restaurantDataUpdated", handleDataUpdate)

    return () => {
      window.removeEventListener("restaurantDataUpdated", handleDataUpdate)
    }
  }, [router, pathname, type])

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        <span className="ml-2 text-lg">Verificando autenticación...</span>
      </div>
    )
  }

  // Si está en la página de login o está autenticado, mostrar el contenido
  if (
    (type === "admin" && pathname.includes("/admin/login")) ||
    (type === "superadmin" && pathname.includes("/superadmin/login")) ||
    isAuthenticated
  ) {
    return <>{children}</>
  }

  // Este caso no debería ocurrir debido a la redirección en useEffect
  return null
}
