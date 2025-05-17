"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ShoppingCart, ChevronLeft, Plus, Minus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { saveOrder } from "@/lib/order-utils"

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

// Tipos para nuestros datos
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  customizable: boolean
  image: string
  options?: {
    name: string
    choices: { id: string; name: string; price: number }[]
  }[]
}

interface CartItem {
  menuItem: MenuItem
  quantity: number
  customizations: Record<string, string>
  totalPrice: number
}

interface Order {
  id: string
  tableId: string
  restaurantId: string
  items: {
    menuItem: {
      id: string
      name: string
      price: number
    }
    quantity: number
    customizations: Record<string, string>
    totalPrice: number
  }[]
  total: number
  status: "pending" | "preparing" | "ready" | "delivered"
  timestamp: string
  paymentMethod: string
  paymentStatus: "pending" | "confirmed"
  orderNumber: string
}

// Datos de ejemplo para el menú
const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Lomo Saltado",
    description: "Carne de res salteada con cebolla, tomate y papas fritas",
    price: 25.0,
    category: "platos-principales",
    customizable: true,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80",
    options: [
      {
        name: "Término de la carne",
        choices: [
          { id: "term-1", name: "Término medio", price: 0 },
          { id: "term-2", name: "Bien cocido", price: 0 },
        ],
      },
      {
        name: "Acompañamiento",
        choices: [
          { id: "side-1", name: "Arroz blanco", price: 0 },
          { id: "side-2", name: "Papas fritas extra", price: 5 },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Ceviche Clásico",
    description: "Pescado fresco marinado en limón con cebolla, cilantro y ají",
    price: 30.0,
    category: "entradas",
    customizable: true,
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1462&q=80",
    options: [
      {
        name: "Nivel de picante",
        choices: [
          { id: "spice-1", name: "Suave", price: 0 },
          { id: "spice-2", name: "Medio", price: 0 },
          { id: "spice-3", name: "Picante", price: 0 },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Ají de Gallina",
    description: "Pollo deshilachado en salsa cremosa de ají amarillo",
    price: 22.0,
    category: "platos-principales",
    customizable: false,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1481&q=80"
  },
  {
    id: "4",
    name: "Causa Limeña",
    description: "Pastel de papa amarilla relleno de pollo o atún",
    price: 18.0,
    category: "entradas",
    customizable: true,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1481&q=80",
    options: [
      {
        name: "Relleno",
        choices: [
          { id: "fill-1", name: "Pollo", price: 0 },
          { id: "fill-2", name: "Atún", price: 3 },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "Chicha Morada",
    description: "Bebida tradicional de maíz morado con frutas y especias",
    price: 8.0,
    category: "bebidas",
    customizable: false,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1481&q=80"
  },
  {
    id: "6",
    name: "Pisco Sour",
    description: "Cóctel peruano a base de pisco, limón y clara de huevo",
    price: 15.0,
    category: "bebidas",
    customizable: false,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1481&q=80"
  },
]

const categories = [
  { id: "entradas", name: "Entradas" },
  { id: "platos-principales", name: "Platos Principales" },
  { id: "bebidas", name: "Bebidas" },
]

export default function TablePage() {
  const params = useParams()
  const restaurantId = params?.id as string
  const tableId = params?.tableId as string
  const router = useRouter()

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [customizations, setCustomizations] = useState<Record<string, string>>({})
  const [restaurant, setRestaurant] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    if (!restaurantId || !tableId) {
      router.push("/restaurantes")
      return
    }

    const foundRestaurant = sampleRestaurants.find((r) => r.id === restaurantId)
    setRestaurant(foundRestaurant)

    if (!foundRestaurant) {
      router.push("/restaurantes")
    }
  }, [restaurantId, tableId, router])

  if (!restaurant) {
    return null
  }

  const addToCart = (item: MenuItem) => {
    if (item.customizable) {
      setSelectedItem(item)
      setCustomizations({})
    } else {
      const existingItem = cart.find(
        (cartItem) =>
          cartItem.menuItem.id === item.id &&
          Object.keys(cartItem.customizations).length === 0
      )

      if (existingItem) {
        updateCartItemQuantity(cart.indexOf(existingItem), existingItem.quantity + 1)
      } else {
        setCart([
          ...cart,
          {
            menuItem: item,
            quantity: 1,
            customizations: {},
            totalPrice: item.price,
          },
        ])
      }
    }
  }

  const confirmCustomization = () => {
    if (!selectedItem) return

    const existingItem = cart.find(
      (cartItem) =>
        cartItem.menuItem.id === selectedItem.id &&
        JSON.stringify(cartItem.customizations) === JSON.stringify(customizations)
    )

    if (existingItem) {
      updateCartItemQuantity(cart.indexOf(existingItem), existingItem.quantity + 1)
    } else {
      setCart([
        ...cart,
        {
          menuItem: selectedItem,
          quantity: 1,
          customizations,
          totalPrice: calculateItemTotal({
            menuItem: selectedItem,
            quantity: 1,
            customizations,
            totalPrice: 0,
          }),
        },
      ])
    }

    setSelectedItem(null)
    setCustomizations({})
  }

  const cancelCustomization = () => {
    setSelectedItem(null)
    setCustomizations({})
  }

  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) {
      const newCart = [...cart]
      newCart.splice(index, 1)
      setCart(newCart)
      return
    }

    const newCart = [...cart]
    newCart[index].quantity = newQuantity
    newCart[index].totalPrice = calculateItemTotal(newCart[index])
    setCart(newCart)
  }

  const calculateItemTotal = (item: CartItem) => {
    let total = item.menuItem.price * item.quantity

    // Sumar el precio de las personalizaciones
    Object.entries(item.customizations).forEach(([optionName, choiceId]) => {
      const option = item.menuItem.options?.find((opt) => opt.name === optionName)
      const choice = option?.choices.find((ch) => ch.id === choiceId)
      if (choice) {
        total += choice.price * item.quantity
      }
    })

    return total
  }

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrito vacío",
        description: "Agrega al menos un item al carrito para realizar el pedido.",
        variant: "destructive",
      })
      return
    }

    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      tableId,
      restaurantId,
      items: cart.map((item) => ({
        menuItem: {
          id: item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price,
        },
        quantity: item.quantity,
        customizations: item.customizations,
        totalPrice: item.totalPrice,
      })),
      total: cart.reduce((sum, item) => sum + item.totalPrice, 0),
      status: "pending",
      timestamp: new Date().toISOString(),
      paymentMethod: "cash",
      paymentStatus: "pending",
      orderNumber: Math.floor(1000 + Math.random() * 9000).toString(),
    }

    try {
      await saveOrder(order)
      toast({
        title: "Pedido realizado",
        description: "Tu pedido ha sido enviado a la cocina.",
      })
      router.push(`/restaurantes/${restaurantId}/mesa/${tableId}/confirmacion`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un error al procesar tu pedido. Por favor, intenta nuevamente.",
        variant: "destructive",
      })
    }
  }

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link href={`/restaurantes/${restaurantId}`} className="mr-4">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <p className="text-muted-foreground">Mesa {tableId}</p>
            </div>
          </div>
          <div className="relative">
            <Button
              variant="outline"
              className="relative"
              onClick={() => document.getElementById("cart")?.scrollIntoView({ behavior: "smooth" })}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span className="font-medium">{cart.length} items</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar en el menú..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredMenuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 px-3 py-1 rounded-full">
                  <span className="font-medium">S/ {item.price.toFixed(2)}</span>
                </div>
              </div>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="w-full bg-rose-600 hover:bg-rose-700"
                  onClick={() => addToCart(item)}
                >
                  Agregar al Carrito
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Cart Section */}
        <div id="cart" className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Tu Pedido</h2>
          {cart.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Tu carrito está vacío. Agrega algunos items del menú.
            </p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.menuItem.name}</h3>
                      {Object.entries(item.customizations).map(([optionName, choiceId]) => {
                        const option = item.menuItem.options?.find((opt) => opt.name === optionName)
                        const choice = option?.choices.find((ch) => ch.id === choiceId)
                        return (
                          <p key={optionName} className="text-sm text-muted-foreground">
                            {optionName}: {choice?.name}
                          </p>
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <span className="font-medium">S/ {item.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">
                  S/ {cart.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)}
                </span>
              </div>
              <Button
                className="w-full mt-6 bg-rose-600 hover:bg-rose-700"
                onClick={handleSubmitOrder}
              >
                Realizar Pedido
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Personalizar {selectedItem.name}</CardTitle>
              <CardDescription>Selecciona tus preferencias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedItem.options?.map((option) => (
                  <div key={option.name}>
                    <Label>{option.name}</Label>
                    <Select
                      value={customizations[option.name] || ""}
                      onValueChange={(value) =>
                        setCustomizations({ ...customizations, [option.name]: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Selecciona ${option.name.toLowerCase()}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {option.choices.map((choice) => (
                          <SelectItem key={choice.id} value={choice.id}>
                            {choice.name}
                            {choice.price > 0 && ` (+S/ ${choice.price.toFixed(2)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={cancelCustomization}>
                Cancelar
              </Button>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={confirmCustomization}>
                Agregar al Carrito
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
