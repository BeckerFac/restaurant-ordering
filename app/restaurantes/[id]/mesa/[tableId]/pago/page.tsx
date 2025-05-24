"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, CreditCard, Banknote, QrCode } from "lucide-react"
import Link from "next/link"

// Add import for order utilities
import { saveOrder, generateOrderNumber } from "@/lib/order-utils"

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

interface CartItem {
  menuItem: {
    id: string
    name: string
    price: number
  }
  quantity: number
  customizations: Record<string, string>
  totalPrice: number
}

export default function PaymentPage({ params }: { params: { id: string; tableId: string } }) {
  const restaurantId = params.id
  const tableId = params.tableId
  const router = useRouter()

  const [restaurant, setRestaurant] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    // Buscar el restaurante por ID
    const foundRestaurant = sampleRestaurants.find((r) => r.id === restaurantId)
    if (foundRestaurant) {
      setRestaurant(foundRestaurant)
    } else {
      router.push("/restaurantes")
    }

    // Recuperar datos del carrito desde sessionStorage
    const savedCart = sessionStorage.getItem("cart")
    const savedTotal = sessionStorage.getItem("cartTotal")

    if (savedCart) {
      setCart(JSON.parse(savedCart))
    }

    if (savedTotal) {
      setCartTotal(Number.parseFloat(savedTotal))
    }
  }, [restaurantId, router])

  // Update the handlePayment function
  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulación de procesamiento de pago
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate a unique order number
    const orderNumber = generateOrderNumber()

    // Crear el objeto de pedido
    const orderData = {
      id: `order-${Date.now()}`,
      restaurantId,
      tableId,
      items: cart,
      total: cartTotal,
      paymentMethod,
      timestamp: new Date().toISOString(),
      status: "pending",
      paymentStatus: "confirmed",
      orderNumber: orderNumber,
    }

    // Save the order using our utility function
    saveOrder(orderData)

    // En un sistema real, aquí enviaríamos los datos a una API
    console.log("Enviando pedido al sistema:", orderData)

    // Simulación de envío exitoso
    setIsProcessing(false)
    setIsComplete(true)

    // Limpiar carrito en sessionStorage
    sessionStorage.removeItem("cart")
    sessionStorage.removeItem("cartTotal")

    // Redirigir después de 3 segundos
    setTimeout(() => {
      router.push(`/restaurantes/${restaurantId}/mesa/${tableId}/confirmacion`)
    }, 3000)
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md">
        <p>Cargando información del restaurante...</p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">¡Pago Completado!</CardTitle>
            <CardDescription>Tu pedido ha sido enviado a la cocina</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p>Redirigiendo a la página de confirmación...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-md">
      <div className="flex items-center mb-6">
        <Link href={`/restaurantes/${restaurantId}/mesa/${tableId}`} className="mr-4">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Pago</h1>
          <p className="text-muted-foreground">
            {restaurant.name} - Mesa {tableId}
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.map((item, index) => (
            <div key={index} className="flex justify-between">
              <div>
                <span className="font-medium">{item.quantity}x </span>
                {item.menuItem.name}
              </div>
              <div>S/ {item.totalPrice.toFixed(2)}</div>
            </div>
          ))}

          <Separator />

          <div className="flex justify-between font-bold">
            <div>Total:</div>
            <div>S/ {cartTotal.toFixed(2)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Método de Pago</CardTitle>
          <CardDescription>Selecciona cómo deseas pagar</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-4">
            <div className="flex items-center space-x-2 border rounded-md p-4">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center cursor-pointer flex-1">
                <CreditCard className="mr-2 h-5 w-5" />
                Tarjeta de Crédito/Débito
              </Label>
            </div>

            <div className="flex items-center space-x-2 border rounded-md p-4">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center cursor-pointer flex-1">
                <Banknote className="mr-2 h-5 w-5" />
                Efectivo
              </Label>
            </div>

            <div className="flex items-center space-x-2 border rounded-md p-4">
              <RadioGroupItem value="qr" id="qr" />
              <Label htmlFor="qr" className="flex items-center cursor-pointer flex-1">
                <QrCode className="mr-2 h-5 w-5" />
                Pago con QR
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "card" && (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Fecha de Expiración</Label>
                  <Input id="expiry" placeholder="MM/AA" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nombre en la Tarjeta</Label>
                <Input id="name" placeholder="Juan Pérez" />
              </div>
            </div>
          )}

          {paymentMethod === "qr" && (
            <div className="mt-6 flex justify-center">
              <div className="border p-4 inline-block">
                <div className="w-48 h-48 bg-gray-200 flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-gray-500" />
                </div>
                <p className="text-center mt-2 text-sm">Escanea para pagar</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={handlePayment} disabled={isProcessing}>
            {isProcessing ? "Procesando..." : "Completar Pago"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
