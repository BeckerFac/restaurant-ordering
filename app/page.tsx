import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MenuIcon as Restaurant, ShieldCheck, Store, Clock, Smartphone, BarChart, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-rose-50 to-white dark:from-rose-950/20 dark:to-background">
        <div className="container mx-auto py-20">
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
            <div className="bg-rose-100 dark:bg-rose-900/30 p-4 rounded-full mb-6">
              <Restaurant className="h-12 w-12 text-rose-600" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">Sistema de Pedidos Digital</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Transforma tu restaurante con nuestra solución integral de gestión y pedidos en línea
            </p>
            <div className="flex gap-4">
              <Link href="/restaurantes">
                <Button size="lg" className="bg-rose-600 hover:bg-rose-700">
                  Comenzar Ahora
                </Button>
              </Link>
              <Link href="#caracteristicas">
                <Button size="lg" variant="outline">
                  Conoce Más
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="caracteristicas" className="container mx-auto py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Características Principales</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-lg w-fit">
                <Clock className="h-6 w-6 text-rose-600" />
              </div>
              <CardTitle className="mt-4">Pedidos en Tiempo Real</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Sistema de pedidos instantáneo que mantiene a tu equipo y clientes sincronizados en todo momento.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-lg w-fit">
                <Smartphone className="h-6 w-6 text-rose-600" />
              </div>
              <CardTitle className="mt-4">Acceso Móvil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interfaz optimizada para dispositivos móviles, permitiendo pedidos desde cualquier lugar.
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-lg w-fit">
                <BarChart className="h-6 w-6 text-rose-600" />
              </div>
              <CardTitle className="mt-4">Análisis Avanzado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dashboard con métricas detalladas para optimizar tu negocio y aumentar las ventas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Access Cards */}
      <div className="container mx-auto py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Acceso al Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="overflow-hidden border-none shadow-lg">
            <CardHeader className="bg-rose-50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-rose-600" />
                <CardTitle>Superadmin</CardTitle>
              </div>
              <CardDescription>Gestión global de restaurantes</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Acceso para administradores del sistema. Gestiona todos los restaurantes, usuarios y configuraciones.</p>
            </CardContent>
            <CardFooter>
              <Link href="/superadmin/login" className="w-full">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">Acceder como Superadmin</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border-none shadow-lg">
            <CardHeader className="bg-rose-50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-rose-600" />
                <CardTitle>Administrador</CardTitle>
              </div>
              <CardDescription>Gestión de restaurante</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Acceso para dueños y administradores de restaurantes. Gestiona menús, mesas y pedidos.</p>
            </CardContent>
            <CardFooter>
              <Link href="/admin/login" className="w-full">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">Acceder como Administrador</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="overflow-hidden border-none shadow-lg">
            <CardHeader className="bg-rose-50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-rose-600" />
                <CardTitle>Cliente</CardTitle>
              </div>
              <CardDescription>Realizar pedidos</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>Acceso para clientes. Explora restaurantes, visualiza menús y realiza pedidos desde tu mesa.</p>
            </CardContent>
            <CardFooter>
              <Link href="/restaurantes" className="w-full">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">Ver Restaurantes</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-rose-50 dark:bg-rose-950/20 py-12">
        <div className="container mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 Sistema de Pedidos Digital. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
