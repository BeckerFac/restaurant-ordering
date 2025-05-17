import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, Store, Table, ArrowLeft } from "lucide-react"
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
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: "rest1002",
    name: "El Rincón del Sabor",
    address: "Calle Secundaria 456, Ciudad",
    description: "Especialidad en mariscos y pescados frescos",
    tables: 10,
    status: "active",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80"
  },
  {
    id: "rest1003",
    name: "Delicias Gourmet",
    address: "Plaza Central 789, Ciudad",
    description: "Alta cocina con ingredientes locales",
    tables: 20,
    status: "active",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
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

  // Tiempo estimado de preparación (entre 15 y 30 minutos)
  const estimatedTime = Math.floor(Math.random() * 15) + 15

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link href={`/restaurantes/${restaurantId}/mesa/${tableId}`} className="mr-4">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Confirmación de Pedido</h1>
              <p className="text-muted-foreground">Tu pedido ha sido recibido</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Confirmation Card */}
            <Card className="border-none shadow-lg">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-2xl">¡Pedido Confirmado!</CardTitle>
                <CardDescription>
                  {restaurant ? restaurant.name : "Restaurante"} - Mesa {tableId}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Clock className="h-5 w-5 text-rose-600" />
                  <div>
                    <p className="font-medium">Tiempo estimado de preparación</p>
                    <p className="text-2xl font-bold">{estimatedTime} minutos</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Store className="h-5 w-5 text-rose-600" />
                  <div>
                    <p className="font-medium">Restaurante</p>
                    <p className="text-lg">{restaurant?.name}</p>
                    <p className="text-sm text-muted-foreground">{restaurant?.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Table className="h-5 w-5 text-rose-600" />
                  <div>
                    <p className="font-medium">Mesa</p>
                    <p className="text-lg">Mesa {tableId}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="font-medium mb-2">Número de Pedido</p>
                  <div className="bg-rose-50 dark:bg-rose-900/30 p-4 rounded-lg text-center">
                    <p className="text-3xl font-bold tracking-wider">{orderNumber}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground text-center">
                  El personal del restaurante atenderá tu mesa pronto. Por favor, mantén este número a mano para cualquier consulta.
                </p>
                <div className="flex gap-4 w-full">
                  <Link href={`/restaurantes/${restaurantId}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Volver al Restaurante
                    </Button>
                  </Link>
                  <Link href="/restaurantes" className="flex-1">
                    <Button className="w-full bg-rose-600 hover:bg-rose-700">
                      Ver Otros Restaurantes
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>

            {/* Restaurant Image */}
            <div className="relative h-full min-h-[400px] rounded-xl overflow-hidden">
              <img
                src={restaurant?.image}
                alt={restaurant?.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">{restaurant?.name}</h2>
                <p className="text-lg">{restaurant?.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
