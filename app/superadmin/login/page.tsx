"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { verifySuperadminCredentials, initializeAuthStore } from "@/lib/auth-store"

export default function SuperadminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const { toast } = useToast()

  // Inicializar el almacén de autenticación
  initializeAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Pequeña demora para simular la verificación
      setTimeout(() => {
        // Verificar credenciales de superadmin
        const isValid = verifySuperadminCredentials(username, password)

        if (isValid) {
          // Guardar información de autenticación
          localStorage.setItem("superadminAuthenticated", "true")

          toast({
            title: "Inicio de sesión exitoso",
            description: "Bienvenido al panel de superadministrador",
            variant: "default",
          })

          // Redirigir al dashboard
          router.push("/superadmin/dashboard")
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

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Acceso Superadministrador</CardTitle>
          <CardDescription>Ingresa tus credenciales para acceder al panel de control global</CardDescription>
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
              <Label htmlFor="password">Contraseña</Label>
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
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Credenciales de demostración:</p>
                <p>
                  Usuario: <span className="font-mono bg-blue-100 px-1 rounded">superadmin</span>
                </p>
                <p>
                  Contraseña: <span className="font-mono bg-blue-100 px-1 rounded">super123</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-center text-sm text-muted-foreground">
          <div>
            <Link href="/" className="text-indigo-600 hover:text-indigo-700">
              Volver a la página principal
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
