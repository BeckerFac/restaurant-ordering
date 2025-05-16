import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Store, ChevronLeft, Table } from "lucide-react"

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

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const restaurantId = params.id

  // Buscar el restaurante por ID
  const restaurant = sampleRestaurants.find((r) => r.id === restaurantId)

  // Si no se encuentra el restaurante, mostrar mensaje
  if (!restaurant) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Link href="/restaurantes" className="mr-4">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Restaurante no encontrado</h1>
        </div>
        <Card>
          <CardContent className="py-10 text-center">
            <p>El restaurante que buscas no existe o no está disponible.</p>
            <Link href="/restaurantes" className="mt-4 inline-block">
              <Button>Volver a la lista de restaurantes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Generar mesas para el restaurante
  const tables = Array.from({ length: restaurant.tables }, (_, i) => i + 1)

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center mb-6">
        <Link href="/restaurantes" className="mr-4">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Store className="h-5 w-5 text-rose-600 mr-2" />
            {restaurant.name}
          </h1>
          <p className="text-muted-foreground">{restaurant.address}</p>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="py-6">
          <p>{restaurant.description}</p>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Selecciona una Mesa</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card key={table} className="overflow-hidden">
            <CardHeader className="bg-rose-50 dark:bg-rose-950/20 py-4">
              <div className="flex items-center gap-2">
                <Table className="h-4 w-4 text-rose-600" />
                <CardTitle className="text-lg">Mesa {table}</CardTitle>
              </div>
            </CardHeader>
            <CardFooter className="py-3">
              <Link href={`/restaurantes/${restaurantId}/mesa/${table}`} className="w-full">
                <Button className="w-full bg-rose-600 hover:bg-rose-700">Ver Menú</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
