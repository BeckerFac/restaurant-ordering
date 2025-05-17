import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Store, ChevronLeft, Table, MapPin, Clock, Star, Users, Phone } from "lucide-react"

// Datos de ejemplo para restaurantes
const sampleRestaurants = [
  {
    id: "rest1001",
    name: "La Buena Mesa",
    address: "Av. Principal 123, Ciudad",
    description: "Cocina tradicional con un toque moderno. Ofrecemos los mejores platos de la gastronomía local, preparados con ingredientes frescos y de temporada. Nuestro chef ejecutivo combina técnicas tradicionales con presentaciones contemporáneas para crear una experiencia culinaria única.",
    tables: 15,
    status: "active",
    rating: 4.8,
    cuisine: "Tradicional",
    openingHours: "12:00 - 23:00",
    phone: "+123 456 7890",
    capacity: "120 personas",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    ]
  },
  {
    id: "rest1002",
    name: "El Rincón del Sabor",
    address: "Calle Secundaria 456, Ciudad",
    description: "Especialidad en mariscos y pescados frescos. Nuestro restaurante se enorgullece de ofrecer los mejores productos del mar, seleccionados diariamente por nuestro chef. Cada plato es una obra maestra que combina sabores tradicionales con técnicas modernas.",
    tables: 10,
    status: "active",
    rating: 4.5,
    cuisine: "Mariscos",
    openingHours: "13:00 - 00:00",
    phone: "+123 456 7891",
    capacity: "80 personas",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    ]
  },
  {
    id: "rest1003",
    name: "Delicias Gourmet",
    address: "Plaza Central 789, Ciudad",
    description: "Alta cocina con ingredientes locales. Nuestro restaurante ofrece una experiencia gastronómica única, donde cada plato cuenta una historia. Utilizamos ingredientes locales de temporada para crear sabores auténticos y memorables.",
    tables: 20,
    status: "active",
    rating: 4.9,
    cuisine: "Gourmet",
    openingHours: "19:00 - 01:00",
    phone: "+123 456 7892",
    capacity: "150 personas",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1374&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    ]
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-10">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link href="/restaurantes" className="mr-4">
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Store className="h-6 w-6 text-rose-600 mr-2" />
              {restaurant.name}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="text-sm font-medium">{restaurant.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground bg-rose-100 dark:bg-rose-900/30 px-2 py-1 rounded-full">
                {restaurant.cuisine}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{restaurant.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>{restaurant.openingHours}</span>
              </div>
            </div>
            <p className="text-lg font-medium">{restaurant.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="mesas" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mesas">Mesas</TabsTrigger>
            <TabsTrigger value="galeria">Galería</TabsTrigger>
            <TabsTrigger value="info">Información</TabsTrigger>
          </TabsList>
          <TabsContent value="mesas">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tables.map((table) => (
                <Card key={table} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="bg-rose-50 dark:bg-rose-950/20 py-4">
                    <div className="flex items-center gap-2">
                      <Table className="h-5 w-5 text-rose-600" />
                      <CardTitle className="text-lg">Mesa {table}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardFooter className="py-4">
                    <Link href={`/restaurantes/${restaurantId}/mesa/${table}`} className="w-full">
                      <Button className="w-full bg-rose-600 hover:bg-rose-700">Ver Menú</Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="galeria">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {restaurant.gallery.map((image, index) => (
                <div key={index} className="relative h-64 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${restaurant.name} - Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="info">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-rose-600" />
                      <span>{restaurant.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-rose-600" />
                      <span>Capacidad: {restaurant.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-rose-600" />
                      <span>Horario: {restaurant.openingHours}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Sobre el Restaurante</h3>
                    <p className="text-muted-foreground">{restaurant.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
