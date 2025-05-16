import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

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

export default function ConfirmationPage({ params }: { params: { id: string; tableId: string } }) {
  const restaurantId = params.id
  const tableId = params.tableId

  // Buscar el restaurante por ID
  const restaurant = sampleRestaurants.find((r) => r.id === restaurantId)

  // Generar un número de pedido aleatorio
  const orderNumber = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")

  return (
    <div className="container mx-auto py-10 px-4 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Pedido Confirmado!</CardTitle>
          <CardDescription>
            {restaurant ? restaurant.name : "Restaurante"} - Mesa {tableId}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>Tu pedido ha sido enviado a la cocina y será preparado en breve.</p>
          <p>El personal del restaurante atenderá tu mesa pronto.</p>
          <div className="border rounded-md p-4 bg-muted/50 mt-4">
            <p className="font-medium">Número de Pedido</p>
            <p className="text-2xl font-bold">{orderNumber}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href={`/restaurantes/${restaurantId}`}>
            <Button className="bg-rose-600 hover:bg-rose-700">Volver al Restaurante</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
