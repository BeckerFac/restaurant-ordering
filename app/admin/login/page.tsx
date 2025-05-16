"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Key, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { verifyAdminCredentials, initializeAuthStore } from "@/lib/auth-store"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDemoAccess, setShowDemoAccess] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  // Inicializar el almacén de autenticación cuando se carga la página
  useEffect(() => {
    initializeAuthStore()
  }, [])

  // Escuchar eventos de actualización de datos
  useEffect(() => {
    const handleDataUpdate = () => {
      // Limpiar cualquier estado de autenticación anterior si estamos en la página de login
      if (window.location.pathname.includes("/admin/login")) {
        localStorage.removeItem("adminAuthenticated")
        localStorage.removeItem("adminUsername")
        localStorage.removeItem("restaurantId")
      }
    }

    window.addEventListener("restaurantDataUpdated", handleDataUpdate)

    return () => {
      window.removeEventListener("restaurantDataUpdated", handleDataUpdate)
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Pequeña demora para simular la verificación
      setTimeout(() => {
        // Verificar credenciales contra nuestro almacén centralizado
        const restaurant = verifyAdminCredentials(username, password)

        if (restaurant) {
          // Guardar información de autenticación
          localStorage.setItem("adminAuthenticated", "true")
          localStorage.setItem("adminUsername", username)
          localStorage.setItem("restaurantId", restaurant.id)

          toast({
            title: "Inicio de sesión exitoso",
            description: `Bienvenido al panel de administración de ${restaurant.name}`,
            variant: "default",
          })

          // Redirigir al dashboard
          router.push("/admin/dashboard")
        } else {
          setError("Credenciales inválidas. Por favor, intenta de nuevo.")
          setIsLoading(false)
        }
      }, 1000)
    } catch (err) {
      setError("Error al iniciar sesión. Por favor, intenta de nuevo más tarde.")
      setIsLoading(false)
    }
  }

  const handleDemoAccess = () => {
    setIsLoading(true)

    // Usar credenciales demo
    setTimeout(() => {
      // Guardar información de autenticación
      localStorage.setItem("adminAuthenticated", "true")
      localStorage.setItem("adminUsername", "admin_demo")
      localStorage.setItem("restaurantId", "rest1001")

      toast({
        title: "Acceso demo activado",
        description: "Has ingresado en modo demostración",
        variant: "default",
      })

      // Redirigir al dashboard
      router.push("/admin/dashboard")
    }, 1000)
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-3 rounded-lg shadow-lg shadow-rose-200 dark:shadow-rose-900/20">
              <Store className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Acceso Administrativo</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al panel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu nombre de usuario"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Contraseña</Label>
                <Link href="#" className="text-xs text-rose-600 hover:text-rose-700">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O</span>
            </div>
          </div>

          {showDemoAccess ? (
            <Button
              variant="outline"
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={handleDemoAccess}
              disabled={isLoading}
            >
              <Key className="mr-2 h-4 w-4" />
              Acceso Demo
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowDemoAccess(true)} disabled={isLoading}>
              ¿Necesitas acceso de prueba?
            </Button>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            <span>¿No tienes una cuenta? </span>
            <Link href="/superadmin/login" className="text-rose-600 hover:text-rose-700">
              Contacta con el administrador
            </Link>
          </div>
          <div>
            <Link href="/" className="text-rose-600 hover:text-rose-700">
              Volver a la página principal
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
