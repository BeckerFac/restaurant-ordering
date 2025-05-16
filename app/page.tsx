import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { MenuIcon as Restaurant, ShieldCheck, Store } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center mb-10 text-center">
        <Restaurant className="h-16 w-16 mb-4 text-rose-600" />
        <h1 className="text-4xl font-bold tracking-tight">Sistema de Pedidos Digital</h1>
        <p className="text-xl text-muted-foreground mt-2">Gestión de restaurantes y pedidos en línea</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="overflow-hidden">
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

        <Card className="overflow-hidden">
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

        <Card className="overflow-hidden">
          <CardHeader className="bg-rose-50 dark:bg-rose-950/20">
            <div className="flex items-center gap-2">
              <Restaurant className="h-5 w-5 text-rose-600" />
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
  )
}
