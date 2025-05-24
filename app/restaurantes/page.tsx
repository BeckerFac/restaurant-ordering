import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Store, ChevronLeft } from "lucide-react"

// Datos de ejemplo para restaurantes
const sampleRestaurants = [
  {
    id: "rest1001",
    name: "La Buena Mesa",
    address: "Av. Principal 123, Ciudad",
    description: "Cocina tradicional con un toque moderno",
    tables: 15,
    status: "active",
  },
  {
    id: "rest1002",
    name: "El Rincón del Sabor",
    address: "Calle Secundaria 456, Ciudad",
    description: "Especialidad en mariscos y pescados frescos",
    tables: 10,
    status: "active",
  },
  {
    id: "rest1003",
    name: "Delicias Gourmet",
    address: "Plaza Central 789, Ciudad",
    description: "Alta cocina con ingredientes locales",
    tables: 20,
    status: "active",
  },
]

export default function RestaurantsPage() {
  // Filtrar solo restaurantes activos
  const activeRestaurants = sampleRestaurants.filter((r) => r.status === "active")

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Restaurantes Disponibles</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeRestaurants.map((restaurant) => (
          <Card key={restaurant.id} className="overflow-hidden">
            <CardHeader className="bg-rose-50 dark:bg-rose-950/20">
              <div className="flex items-center gap-2">
                <Store className="h-5 w-5 text-rose-600" />
                <CardTitle>{restaurant.name}</CardTitle>
              </div>
              <CardDescription>{restaurant.address}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p>{restaurant.description}</p>
              <p className="mt-2 text-sm text-muted-foreground">{restaurant.tables} mesas disponibles</p>
            </CardContent>
            <CardFooter>
              <Link href={`/restaurantes/${restaurant.id}`} className="w-full">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">Ver Restaurante</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
