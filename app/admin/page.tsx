"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChefHat, Clock, CheckCircle2, AlertCircle, Search, Lock, LogIn, CalendarDays } from "lucide-react"
import Link from "next/link"

// Tipos para nuestros datos
interface OrderItem {
  menuItem: {
    id: string
    name: string
    price: number
  }
  quantity: number
  customizations: Record<string, string>
  totalPrice: number
}

interface Order {
  id: string
  tableId: string
  items: OrderItem[]
  total: number
  status: "pending" | "preparing" | "ready" | "delivered"
  timestamp: string
  paymentMethod: string
}

// Datos de ejemplo para órdenes
const sampleOrders: Order[] = [
  {
    id: "1001",
    tableId: "3",
    items: [
      {
        menuItem: {
          id: "1",
          name: "Lomo Saltado",
          price: 25.0,
        },
        quantity: 2,
        customizations: {
          "Término de la carne": "Término medio",
          Acompañamiento: "Arroz blanco",
        },
        totalPrice: 50.0,
      },
      {
        menuItem: {
          id: "5",
          name: "Chicha Morada",
          price: 8.0,
        },
        quantity: 2,
        customizations: {},
        totalPrice: 16.0,
      },
    ],
    total: 66.0,
    status: "pending",
    timestamp: "2025-05-14T14:30:00Z",
    paymentMethod: "card",
  },
  {
    id: "1002",
    tableId: "5",
    items: [
      {
        menuItem: {
          id: "2",
          name: "Ceviche Clásico",
          price: 30.0,
        },
        quantity: 1,
        customizations: {
          "Nivel de picante": "Medio",
        },
        totalPrice: 30.0,
      },
    ],
    total: 30.0,
    status: "preparing",
    timestamp: "2025-05-14T14:15:00Z",
    paymentMethod: "cash",
  },
  {
    id: "1003",
    tableId: "8",
    items: [
      {
        menuItem: {
          id: "3",
          name: "Ají de Gallina",
          price: 22.0,
        },
        quantity: 1,
        customizations: {},
        totalPrice: 22.0,
      },
      {
        menuItem: {
          id: "4",
          name: "Causa Limeña",
          price: 18.0,
        },
        quantity: 1,
        customizations: {
          Relleno: "Pollo",
        },
        totalPrice: 18.0,
      },
      {
        menuItem: {
          id: "6",
          name: "Pisco Sour",
          price: 15.0,
        },
        quantity: 2,
        customizations: {},
        totalPrice: 30.0,
      },
    ],
    total: 70.0,
    status: "ready",
    timestamp: "2025-05-14T14:00:00Z",
    paymentMethod: "qr",
  },
]

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [orders, setOrders] = useState<Order[]>(sampleOrders)
  const [searchTerm, setSearchTerm] = useState("")

  // Función para actualizar el estado de una orden
  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
    )
  }

  // Filtrar órdenes por término de búsqueda
  const filteredOrders = orders.filter((order) => order.id.includes(searchTerm) || order.tableId.includes(searchTerm))

  // Agrupar órdenes por estado
  const pendingOrders = filteredOrders.filter((order) => order.status === "pending")
  const preparingOrders = filteredOrders.filter((order) => order.status === "preparing")
  const readyOrders = filteredOrders.filter((order) => order.status === "ready")
  const deliveredOrders = filteredOrders.filter((order) => order.status === "delivered")

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Función para manejar el inicio de sesión
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // En un sistema real, aquí verificaríamos las credenciales contra una API
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true)
    } else {
      alert("Credenciales incorrectas")
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md flex items-center justify-center min-h-screen">
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-rose-600" />
            </div>
            <CardTitle>Acceso al Panel de Administración</CardTitle>
            <CardDescription>Ingresa tus credenciales para continuar</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700">
                <LogIn className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-center text-sm text-muted-foreground">
            <p>Para demo: usuario "admin", contraseña "admin123"</p>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestión de Pedidos del Restaurante</p>
        </div>
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por # de pedido o mesa"
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/admin/reservas">
            <Button variant="outline" className="whitespace-nowrap">
              <CalendarDays className="mr-2 h-4 w-4" />
              Gestionar Reservas
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="relative">
            Pendientes
            {pendingOrders.length > 0 && <Badge className="ml-2 bg-rose-600">{pendingOrders.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="preparing" className="relative">
            En Preparación
            {preparingOrders.length > 0 && <Badge className="ml-2 bg-amber-500">{preparingOrders.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="ready" className="relative">
            Listos
            {readyOrders.length > 0 && <Badge className="ml-2 bg-green-600">{readyOrders.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="delivered">Entregados</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay pedidos pendientes</p>
              </CardContent>
            </Card>
          ) : (
            pendingOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        Pedido #{order.id}
                        <Badge className="ml-2 bg-rose-600">Pendiente</Badge>
                      </CardTitle>
                      <CardDescription>
                        Mesa {order.tableId} • {formatDate(order.timestamp)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">S/ {order.total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Pago:{" "}
                        {order.paymentMethod === "card"
                          ? "Tarjeta"
                          : order.paymentMethod === "cash"
                            ? "Efectivo"
                            : "QR"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.quantity}x </span>
                          {item.menuItem.name}
                          {Object.entries(item.customizations).length > 0 && (
                            <div className="text-sm text-muted-foreground ml-5">
                              {Object.entries(item.customizations).map(([key, value]) => (
                                <div key={key}>
                                  • {key}: {value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>S/ {item.totalPrice.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    onClick={() => updateOrderStatus(order.id, "preparing")}
                  >
                    <ChefHat className="mr-2 h-4 w-4" />
                    Comenzar Preparación
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="preparing" className="space-y-4">
          {preparingOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay pedidos en preparación</p>
              </CardContent>
            </Card>
          ) : (
            preparingOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        Pedido #{order.id}
                        <Badge className="ml-2 bg-amber-500">En Preparación</Badge>
                      </CardTitle>
                      <CardDescription>
                        Mesa {order.tableId} • {formatDate(order.timestamp)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">S/ {order.total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Pago:{" "}
                        {order.paymentMethod === "card"
                          ? "Tarjeta"
                          : order.paymentMethod === "cash"
                            ? "Efectivo"
                            : "QR"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.quantity}x </span>
                          {item.menuItem.name}
                          {Object.entries(item.customizations).length > 0 && (
                            <div className="text-sm text-muted-foreground ml-5">
                              {Object.entries(item.customizations).map(([key, value]) => (
                                <div key={key}>
                                  • {key}: {value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>S/ {item.totalPrice.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => updateOrderStatus(order.id, "ready")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Marcar como Listo
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="ready" className="space-y-4">
          {readyOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay pedidos listos para entregar</p>
              </CardContent>
            </Card>
          ) : (
            readyOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        Pedido #{order.id}
                        <Badge className="ml-2 bg-green-600">Listo</Badge>
                      </CardTitle>
                      <CardDescription>
                        Mesa {order.tableId} • {formatDate(order.timestamp)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">S/ {order.total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Pago:{" "}
                        {order.paymentMethod === "card"
                          ? "Tarjeta"
                          : order.paymentMethod === "cash"
                            ? "Efectivo"
                            : "QR"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.quantity}x </span>
                          {item.menuItem.name}
                          {Object.entries(item.customizations).length > 0 && (
                            <div className="text-sm text-muted-foreground ml-5">
                              {Object.entries(item.customizations).map(([key, value]) => (
                                <div key={key}>
                                  • {key}: {value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>S/ {item.totalPrice.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => updateOrderStatus(order.id, "delivered")}>
                    <Clock className="mr-2 h-4 w-4" />
                    Marcar como Entregado
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          {deliveredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay pedidos entregados</p>
              </CardContent>
            </Card>
          ) : (
            deliveredOrders.map((order) => (
              <Card key={order.id} className="opacity-70">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        Pedido #{order.id}
                        <Badge className="ml-2" variant="outline">
                          Entregado
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Mesa {order.tableId} • {formatDate(order.timestamp)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">S/ {order.total.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        Pago:{" "}
                        {order.paymentMethod === "card"
                          ? "Tarjeta"
                          : order.paymentMethod === "cash"
                            ? "Efectivo"
                            : "QR"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <span className="font-medium">{item.quantity}x </span>
                          {item.menuItem.name}
                          {Object.entries(item.customizations).length > 0 && (
                            <div className="text-sm text-muted-foreground ml-5">
                              {Object.entries(item.customizations).map(([key, value]) => (
                                <div key={key}>
                                  • {key}: {value}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>S/ {item.totalPrice.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
