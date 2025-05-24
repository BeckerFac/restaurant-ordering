"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ShoppingCart, ChevronLeft, Plus, Minus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Tipos para nuestros datos
interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  customizable: boolean
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

// Datos de ejemplo para el menú
const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Lomo Saltado",
    description: "Carne de res salteada con cebolla, tomate y papas fritas",
    price: 25.0,
    category: "platos-principales",
    customizable: true,
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
  },
  {
    id: "4",
    name: "Causa Limeña",
    description: "Pastel de papa amarilla relleno de pollo o atún",
    price: 18.0,
    category: "entradas",
    customizable: true,
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
  },
  {
    id: "6",
    name: "Pisco Sour",
    description: "Cóctel peruano a base de pisco, limón y clara de huevo",
    price: 15.0,
    category: "bebidas",
    customizable: false,
  },
]

export default function TablePage({ params }: { params: { id: string } }) {
  const tableId = params.id
  const router = useRouter()

  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [customizations, setCustomizations] = useState<Record<string, string>>({})

  // Calcular el total del carrito
  const cartTotal = cart.reduce((total, item) => total + item.totalPrice, 0)

  // Agrupar elementos del menú por categoría
  const categories = {
    entradas: "Entradas",
    "platos-principales": "Platos Principales",
    bebidas: "Bebidas",
  }

  // Función para agregar un elemento al carrito
  const addToCart = (item: MenuItem) => {
    if (item.customizable) {
      setSelectedItem(item)
      // Inicializar customizaciones con valores predeterminados
      const initialCustomizations: Record<string, string> = {}
      item.options?.forEach((option) => {
        initialCustomizations[option.name] = option.choices[0].id
      })
      setCustomizations(initialCustomizations)
    } else {
      // Si no es personalizable, agregar directamente al carrito
      const existingItemIndex = cart.findIndex(
        (cartItem) => cartItem.menuItem.id === item.id && !cartItem.menuItem.customizable,
      )

      if (existingItemIndex >= 0) {
        // Incrementar cantidad si ya existe
        const newCart = [...cart]
        newCart[existingItemIndex].quantity += 1
        newCart[existingItemIndex].totalPrice = newCart[existingItemIndex].quantity * item.price
        setCart(newCart)
      } else {
        // Agregar nuevo item
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

  // Función para confirmar la adición de un elemento personalizable
  const confirmCustomization = () => {
    if (!selectedItem) return

    // Calcular precio adicional basado en las opciones seleccionadas
    let additionalPrice = 0
    const customizationDetails: Record<string, string> = {}

    selectedItem.options?.forEach((option) => {
      const selectedChoiceId = customizations[option.name]
      const selectedChoice = option.choices.find((choice) => choice.id === selectedChoiceId)

      if (selectedChoice) {
        additionalPrice += selectedChoice.price
        customizationDetails[option.name] = selectedChoice.name
      }
    })

    // Agregar al carrito con las personalizaciones
    setCart([
      ...cart,
      {
        menuItem: selectedItem,
        quantity: 1,
        customizations: customizationDetails,
        totalPrice: selectedItem.price + additionalPrice,
      },
    ])

    // Limpiar selección
    setSelectedItem(null)
    setCustomizations({})
  }

  // Función para cancelar la personalización
  const cancelCustomization = () => {
    setSelectedItem(null)
    setCustomizations({})
  }

  // Función para actualizar la cantidad de un elemento en el carrito
  const updateCartItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Eliminar el elemento si la cantidad es 0 o menos
      const newCart = [...cart]
      newCart.splice(index, 1)
      setCart(newCart)
    } else {
      // Actualizar la cantidad
      const newCart = [...cart]
      newCart[index].quantity = newQuantity
      newCart[index].totalPrice = calculateItemTotal(newCart[index])
      setCart(newCart)
    }
  }

  // Calcular el total de un elemento del carrito
  const calculateItemTotal = (item: CartItem) => {
    let basePrice = item.menuItem.price

    // Agregar precios adicionales de personalizaciones
    if (item.menuItem.customizable && item.menuItem.options) {
      item.menuItem.options.forEach((option) => {
        const choiceName = item.customizations[option.name]
        const choice = option.choices.find((c) => c.name === choiceName)
        if (choice) {
          basePrice += choice.price
        }
      })
    }

    return basePrice * item.quantity
  }

  // Función para proceder al pago
  const proceedToCheckout = () => {
    if (cart.length > 0) {
      // Guardar el carrito en sessionStorage para recuperarlo en la página de pago
      sessionStorage.setItem("cart", JSON.stringify(cart))
      sessionStorage.setItem("tableId", tableId)
      sessionStorage.setItem("cartTotal", cartTotal.toString())

      // Redirigir a la página de pago
      router.push(`/pago/${tableId}`)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Mesa {tableId} - Menú Digital</h1>
      </div>

      {selectedItem ? (
        // Vista de personalización
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personalizar: {selectedItem.name}</CardTitle>
            <CardDescription>Selecciona tus preferencias</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItem.options?.map((option) => (
              <div key={option.name} className="space-y-2">
                <Label>{option.name}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {option.choices.map((choice) => (
                    <div key={choice.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={choice.id}
                        name={option.name}
                        value={choice.id}
                        checked={customizations[option.name] === choice.id}
                        onChange={() =>
                          setCustomizations({
                            ...customizations,
                            [option.name]: choice.id,
                          })
                        }
                        className="h-4 w-4 text-rose-600"
                      />
                      <Label htmlFor={choice.id} className="flex-1">
                        {choice.name}
                        {choice.price > 0 && (
                          <span className="text-rose-600 ml-1">(+S/ {choice.price.toFixed(2)})</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={cancelCustomization}>
              Cancelar
            </Button>
            <Button className="bg-rose-600 hover:bg-rose-700" onClick={confirmCustomization}>
              Agregar al Pedido
            </Button>
          </CardFooter>
        </Card>
      ) : (
        // Vista normal del menú
        <Tabs defaultValue="entradas" className="mb-6">
          <TabsList className="mb-4">
            {Object.entries(categories).map(([key, label]) => (
              <TabsTrigger key={key} value={key}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.keys(categories).map((category) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {menuItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{item.name}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </div>
                        <div className="text-lg font-bold">S/ {item.price.toFixed(2)}</div>
                      </div>
                    </CardHeader>
                    <CardFooter>
                      <Button className="w-full bg-rose-600 hover:bg-rose-700" onClick={() => addToCart(item)}>
                        Agregar al Pedido
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Carrito de compras */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Tu Pedido
          </CardTitle>
          <CardDescription>Mesa {tableId}</CardDescription>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Tu carrito está vacío</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-start border-b pb-4">
                  <div className="flex-1">
                    <div className="font-medium">{item.menuItem.name}</div>
                    {Object.entries(item.customizations).length > 0 && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {Object.entries(item.customizations).map(([key, value]) => (
                          <div key={key}>
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <div className="w-20 text-right font-medium">S/ {item.totalPrice.toFixed(2)}</div>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4 font-bold text-lg">
                <div>Total:</div>
                <div>S/ {cartTotal.toFixed(2)}</div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-rose-600 hover:bg-rose-700"
            disabled={cart.length === 0}
            onClick={proceedToCheckout}
          >
            Proceder al Pago
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
