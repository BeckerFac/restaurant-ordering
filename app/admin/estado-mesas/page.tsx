"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, LogOut, Store, Table, UtensilsCrossed, Clock, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { getRestaurantOrders, updateOrderStatus, initOrderSync, setupOrderPolling } from "@/lib/order-utils"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

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
  paymentStatus: "pending" | "confirmed"
  orderNumber?: string
  restaurantId?: string
}

interface RestaurantTable {
  id: string
  number: number
  capacity: number
  status: "available" | "occupied" | "reserved"
  currentOrder?: string
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
    paymentStatus: "pending",
    orderNumber: "A123",
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
    paymentStatus: "confirmed",
    orderNumber: "B456",
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
    paymentStatus: "confirmed",
    orderNumber: "C789",
  },
]

// Datos de ejemplo para mesas
const sampleTables: RestaurantTable[] = [
  { id: "table1", number: 1, capacity: 4, status: "available" },
  { id: "table2", number: 2, capacity: 2, status: "available" },
  { id: "table3", number: 3, capacity: 6, status: "occupied", currentOrder: "A123" },
  { id: "table4", number: 4, capacity: 4, status: "available" },
  { id: "table5", number: 5, capacity: 2, status: "occupied", currentOrder: "B456" },
  { id: "table6", number: 6, capacity: 8, status: "available" },
  { id: "table7", number: 7, capacity: 4, status: "available" },
  { id: "table8", number: 8, capacity: 6, status: "occupied", currentOrder: "C789" },
  { id: "table9", number: 9, capacity: 2, status: "available" },
  { id: "table10", number: 10, capacity: 4, status: "available" },
]

// Datos de ejemplo para restaurantes
const sampleRestaurants = [
  {
    id: "rest1001",
    name: "La Buena Mesa",
    address: "Av. Principal 123, Ciudad",
    phone: "999888777",
    email: "contacto@labuenamesarestaurante.com",
    tables: 15,
    adminUsername: "admin_buenaMesa",
    adminPassword: "resto123",
    status: "active",
    createdAt: "2025-01-15T10:30:00Z",
  },
  {
    id: "rest1002",
    name: "El Rincón del Sabor",
    address: "Calle Secundaria 456, Ciudad",
    phone: "999777666",
    email: "info@rincondelsabor.com",
    tables: 10,
    adminUsername: "admin_rincon",
    adminPassword: "resto456",
    status: "active",
    createdAt: "2025-02-20T14:45:00Z",
  },
  {
    id: "rest1003",
    name: "Delicias Gourmet",
    address: "Plaza Central 789, Ciudad",
    phone: "999666555",
    email: "reservas@deliciasgourmet.com",
    tables: 20,
    adminUsername: "admin_delicias",
    adminPassword: "resto789",
    status: "inactive",
    createdAt: "2025-03-10T09:15:00Z",
  },
]

export default function TableStatusPage() {
  const [orders, setOrders] = useState<Order[]>(sampleOrders)
  const [tables, setTables] = useState<RestaurantTable[]>(sampleTables)
  const [searchTerm, setSearchTerm] = useState("")
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null)
  const [activeView, setActiveView] = useState<"grid" | "list">("grid")
  const [updateTrigger, setUpdateTrigger] = useState(0)
  const [hasNotifications, setHasNotifications] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const router = useRouter()
  const { toast } = useToast()

  // Function to update tables based on orders
  const updateTablesFromOrders = (currentOrders: Order[]) => {
    setTables((prevTables) => {
      // Create a copy of the current tables
      const updatedTables = [...prevTables]

      // Reset all tables to available first
      updatedTables.forEach((table) => {
        if (table.status === "occupied" && !table.currentOrder) {
          table.status = "available"
        }
      })

      // Update tables based on active orders
      currentOrders.forEach((order) => {
        if (order.status !== "delivered") {
          const tableIndex = updatedTables.findIndex((t) => t.number.toString() === order.tableId)
          if (tableIndex !== -1) {
            updatedTables[tableIndex] = {
              ...updatedTables[tableIndex],
              status: "occupied",
              currentOrder: order.orderNumber,
            }
          }
        }
      })

      return updatedTables
    })
  }

  // Function to handle order updates from any source
  const handleOrderUpdate = (updateType: string, data: any) => {
    if (updateType === "newOrder") {
      const newOrder = data

      // Only process if it's for this restaurant
      if (newOrder.restaurantId === restaurantId) {
        setOrders((prevOrders) => {
          // Check if we already have this order
          if (!prevOrders.some((order) => order.id === newOrder.id)) {
            // Add the new order
            const updatedOrders = [...prevOrders, newOrder]

            // Update tables based on the new order
            updateTablesFromOrders(updatedOrders)

            // Show notification
            toast({
              title: "¡Nuevo pedido recibido!",
              description: `Mesa ${newOrder.tableId}: ${newOrder.items.length} items - S/ ${newOrder.total.toFixed(2)}`,
              variant: "default",
            })

            setHasNotifications(true)

            return updatedOrders
          }
          return prevOrders
        })
      }
    } else if (updateType === "statusUpdate") {
      const { orderId, newStatus, order } = data

      // Update the order status
      setOrders((prevOrders) => {
        const updatedOrders = prevOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))

        // If the order is delivered, update the table status
        if (newStatus === "delivered" && order) {
          setTables((prevTables) => {
            return prevTables.map((table) => {
              if (table.currentOrder === order.orderNumber) {
                return { ...table, status: "available", currentOrder: undefined }
              }
              return table
            })
          })
        }

        return updatedOrders
      })
    } else if (updateType === "refresh") {
      // Full refresh of orders
      const currentOrders = data
      setOrders(currentOrders)
      updateTablesFromOrders(currentOrders)
      setLastRefresh(new Date())
    }
  }

  // Verificar autenticación al cargar la página
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/admin/login")
      return
    }

    // Obtener información del restaurante
    const currentRestaurantId = localStorage.getItem("restaurantId")
    if (currentRestaurantId) {
      setRestaurantId(currentRestaurantId)
      const restaurant = sampleRestaurants.find((r) => r.id === currentRestaurantId)
      if (restaurant) {
        setRestaurantInfo(restaurant)
      }

      // Load initial orders for this restaurant
      const restaurantOrders = getRestaurantOrders(currentRestaurantId)
      // Merge with sample orders for demo purposes
      const allOrders = [...sampleOrders, ...restaurantOrders]
      setOrders(allOrders)

      // Update tables based on orders
      updateTablesFromOrders(allOrders)
    }

    // Initialize order synchronization
    const cleanupOrderSync = initOrderSync(handleOrderUpdate)

    // Set up polling as a fallback
    const cleanupPolling = setupOrderPolling(
      currentRestaurantId || "",
      (orders) => handleOrderUpdate("refresh", orders),
      30000, // Poll every 30 seconds
    )

    // Listen for direct events within the same tab
    const handleNewOrder = (event: CustomEvent) => {
      const newOrder = event.detail.order
      if (newOrder.restaurantId === currentRestaurantId) {
        handleOrderUpdate("newOrder", newOrder)
      }
    }

    const handleStatusUpdate = (event: CustomEvent) => {
      const { orderId, newStatus, order } = event.detail
      handleOrderUpdate("statusUpdate", { orderId, newStatus, order })
    }

    window.addEventListener("newOrderPlaced", handleNewOrder as EventListener)
    window.addEventListener("orderStatusUpdated", handleStatusUpdate as EventListener)

    return () => {
      cleanupOrderSync()
      cleanupPolling()
      window.removeEventListener("newOrderPlaced", handleNewOrder as EventListener)
      window.removeEventListener("orderStatusUpdated", handleStatusUpdate as EventListener)
    }
  }, [router, toast])

  // Actualizar datos cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setUpdateTrigger((prev) => prev + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminUsername")
    localStorage.removeItem("restaurantId")
    router.push("/")
  }

  // Función para refrescar datos manualmente
  const handleRefresh = () => {
    if (restaurantId) {
      const restaurantOrders = getRestaurantOrders(restaurantId)
      handleOrderUpdate("refresh", restaurantOrders)

      toast({
        title: "Datos actualizados",
        description: `Última actualización: ${new Date().toLocaleTimeString()}`,
        variant: "default",
      })
    }
  }

  // Filtrar mesas por término de búsqueda
  const filteredTables = tables.filter(
    (table) =>
      table.number.toString().includes(searchTerm) || table.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Obtener órdenes activas por mesa
  const getOrdersForTable = (tableId: string) => {
    return orders.filter(
      (order) =>
        order.tableId === tableId &&
        (order.status === "pending" || order.status === "preparing" || order.status === "ready"),
    )
  }

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  // Calcular tiempo transcurrido desde la orden
  const getElapsedTime = (timestamp: string) => {
    const orderTime = new Date(timestamp).getTime()
    const now = new Date().getTime()
    const elapsed = now - orderTime

    const minutes = Math.floor(elapsed / 60000)
    if (minutes < 60) {
      return `${minutes} min`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
  }

  // Función para actualizar el estado de una orden
  const handleOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    // Use the utility function to update the order status
    updateOrderStatus(orderId, newStatus)

    // Update local state
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

    // Show notification
    toast({
      title: "Estado actualizado",
      description: `Pedido #${orderId} ahora está ${
        newStatus === "pending"
          ? "pendiente"
          : newStatus === "preparing"
            ? "en preparación"
            : newStatus === "ready"
              ? "listo"
              : "entregado"
      }`,
      variant: "default",
    })
  }

  // Obtener la orden por su número
  const getOrderByNumber = (orderNumber: string | undefined) => {
    if (!orderNumber) return null
    return orders.find((order) => order.orderNumber === orderNumber)
  }

  if (!restaurantInfo) {
    return (
      <div className="container mx-auto py-10 px-4 flex items-center justify-center">
        <p>Cargando información del restaurante...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Toaster />
      <div className="bg-white dark:bg-gray-950 border-b mb-6 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <Link href="/admin/dashboard" className="mr-3">
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center">
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-3 rounded-lg shadow-lg shadow-rose-200 dark:shadow-rose-900/20 mr-3">
                <Store className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{restaurantInfo.name}</h1>
                <p className="text-muted-foreground">Estado de Mesas y Pedidos</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar mesa por número o estado"
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-full" onClick={handleRefresh}>
              <Clock className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <Card className="p-4 flex items-center gap-3 flex-1 border-l-4 border-l-rose-500">
          <div className="bg-rose-100 dark:bg-rose-900/50 p-3 rounded-full">
            <Table className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mesas Ocupadas</p>
            <p className="text-2xl font-bold">
              {tables.filter((t) => t.status === "occupied").length}/{tables.length}
            </p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 flex-1 border-l-4 border-l-amber-500">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full">
            <UtensilsCrossed className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pedidos Activos</p>
            <p className="text-2xl font-bold">{orders.filter((o) => o.status !== "delivered").length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 flex-1 border-l-4 border-l-green-500">
          <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
            <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Última Actualización</p>
            <p className="text-lg font-bold">{lastRefresh.toLocaleTimeString()}</p>
          </div>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Table className="h-5 w-5 text-rose-600" />
          Vista de Mesas
        </h2>
        <div className="flex gap-2">
          <Button
            variant={activeView === "grid" ? "default" : "outline"}
            className={activeView === "grid" ? "bg-rose-600 hover:bg-rose-700" : ""}
            onClick={() => setActiveView("grid")}
            size="sm"
          >
            Cuadrícula
          </Button>
          <Button
            variant={activeView === "list" ? "default" : "outline"}
            className={activeView === "list" ? "bg-rose-600 hover:bg-rose-700" : ""}
            onClick={() => setActiveView("list")}
            size="sm"
          >
            Lista
          </Button>
        </div>
      </div>

      {activeView === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => {
            const tableOrder = getOrderByNumber(table.currentOrder)
            const hasOrder = !!tableOrder

            return (
              <Card
                key={table.id}
                className={`${
                  table.status === "occupied"
                    ? tableOrder?.status === "pending"
                      ? "border-amber-200 bg-amber-50/30 dark:bg-amber-950/10"
                      : tableOrder?.status === "preparing"
                        ? "border-blue-200 bg-blue-50/30 dark:bg-blue-950/10"
                        : tableOrder?.status === "ready"
                          ? "border-green-200 bg-green-50/30 dark:bg-green-950/10"
                          : "border-rose-200 bg-rose-50/30 dark:bg-rose-950/10"
                    : ""
                } hover:shadow-md transition-shadow`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        Mesa {table.number}
                        {hasOrder && (
                          <Badge
                            className={`ml-2 ${
                              tableOrder.status === "pending"
                                ? "bg-amber-500"
                                : tableOrder.status === "preparing"
                                  ? "bg-blue-500"
                                  : "bg-green-600"
                            }`}
                          >
                            {tableOrder.status === "pending"
                              ? "Pendiente"
                              : tableOrder.status === "preparing"
                                ? "Preparando"
                                : "Listo"}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>Capacidad: {table.capacity} personas</CardDescription>
                    </div>
                    <Badge
                      className={
                        table.status === "available"
                          ? "bg-green-600"
                          : table.status === "occupied"
                            ? "bg-rose-600"
                            : "bg-amber-500"
                      }
                    >
                      {table.status === "available"
                        ? "Disponible"
                        : table.status === "occupied"
                          ? "Ocupada"
                          : "Reservada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {hasOrder ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-medium">Pedido #{tableOrder.orderNumber || tableOrder.id}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(tableOrder.timestamp)} • {getElapsedTime(tableOrder.timestamp)}
                        </div>
                      </div>
                      <div className="text-sm max-h-48 overflow-auto">
                        {tableOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between mb-1">
                            <span>
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span>S/ {item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between font-medium pt-2 border-t">
                        <span>Total:</span>
                        <span>S/ {tableOrder.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        {tableOrder.status === "pending" && (
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600"
                            onClick={() => handleOrderStatus(tableOrder.id, "preparing")}
                          >
                            Preparar
                          </Button>
                        )}
                        {tableOrder.status === "preparing" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleOrderStatus(tableOrder.id, "ready")}
                          >
                            Listo
                          </Button>
                        )}
                        {tableOrder.status === "ready" && (
                          <Button size="sm" onClick={() => handleOrderStatus(tableOrder.id, "delivered")}>
                            Entregar
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      {table.status === "occupied" ? "Mesa ocupada sin pedidos activos" : "Mesa sin pedidos"}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="occupied">Ocupadas</TabsTrigger>
            <TabsTrigger value="available">Disponibles</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              {filteredTables.map((table) => {
                const tableOrder = getOrderByNumber(table.currentOrder)
                const hasOrder = !!tableOrder

                return (
                  <Card
                    key={table.id}
                    className={`${
                      table.status === "occupied"
                        ? tableOrder?.status === "pending"
                          ? "border-amber-200 bg-amber-50/30 dark:bg-amber-950/10"
                          : tableOrder?.status === "preparing"
                            ? "border-blue-200 bg-blue-50/30 dark:bg-blue-950/10"
                            : tableOrder?.status === "ready"
                              ? "border-green-200 bg-green-50/30 dark:bg-green-950/10"
                              : "border-rose-200 bg-rose-50/30 dark:bg-rose-950/10"
                        : ""
                    }`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center">
                            Mesa {table.number}
                            {hasOrder && (
                              <Badge
                                className={`ml-2 ${
                                  tableOrder.status === "pending"
                                    ? "bg-amber-500"
                                    : tableOrder.status === "preparing"
                                      ? "bg-blue-500"
                                      : "bg-green-600"
                                }`}
                              >
                                {tableOrder.status === "pending"
                                  ? "Pendiente"
                                  : tableOrder.status === "preparing"
                                    ? "Preparando"
                                    : "Listo"}
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>Capacidad: {table.capacity} personas</CardDescription>
                        </div>
                        <Badge
                          className={
                            table.status === "available"
                              ? "bg-green-600"
                              : table.status === "occupied"
                                ? "bg-rose-600"
                                : "bg-amber-500"
                          }
                        >
                          {table.status === "available"
                            ? "Disponible"
                            : table.status === "occupied"
                              ? "Ocupada"
                              : "Reservada"}
                        </Badge>
                      </div>
                    </CardHeader>
                    {hasOrder && (
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="font-medium">Pedido #{tableOrder.orderNumber || tableOrder.id}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(tableOrder.timestamp)} • {getElapsedTime(tableOrder.timestamp)}
                            </div>
                          </div>
                          <div className="text-sm">
                            {tableOrder.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between mb-1">
                                <span>
                                  {item.quantity}x {item.menuItem.name}
                                </span>
                                <span>S/ {item.totalPrice.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between font-medium pt-2 border-t">
                            <span>Total:</span>
                            <span>S/ {tableOrder.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            {tableOrder.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-amber-500 hover:bg-amber-600"
                                onClick={() => handleOrderStatus(tableOrder.id, "preparing")}
                              >
                                Preparar
                              </Button>
                            )}
                            {tableOrder.status === "preparing" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleOrderStatus(tableOrder.id, "ready")}
                              >
                                Listo
                              </Button>
                            )}
                            {tableOrder.status === "ready" && (
                              <Button size="sm" onClick={() => handleOrderStatus(tableOrder.id, "delivered")}>
                                Entregar
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="occupied">
            <div className="space-y-4">
              {filteredTables
                .filter((table) => table.status === "occupied")
                .map((table) => {
                  const tableOrder = getOrderByNumber(table.currentOrder)
                  const hasOrder = !!tableOrder

                  return (
                    <Card
                      key={table.id}
                      className={`${
                        hasOrder
                          ? tableOrder.status === "pending"
                            ? "border-amber-200 bg-amber-50/30 dark:bg-amber-950/10"
                            : tableOrder.status === "preparing"
                              ? "border-blue-200 bg-blue-50/30 dark:bg-blue-950/10"
                              : "border-green-200 bg-green-50/30 dark:bg-green-950/10"
                          : "border-rose-200 bg-rose-50/30 dark:bg-rose-950/10"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              Mesa {table.number}
                              {hasOrder && (
                                <Badge
                                  className={`ml-2 ${
                                    tableOrder.status === "pending"
                                      ? "bg-amber-500"
                                      : tableOrder.status === "preparing"
                                        ? "bg-blue-500"
                                        : "bg-green-600"
                                  }`}
                                >
                                  {tableOrder.status === "pending"
                                    ? "Pendiente"
                                    : tableOrder.status === "preparing"
                                      ? "Preparando"
                                      : "Listo"}
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>Capacidad: {table.capacity} personas</CardDescription>
                          </div>
                          <Badge className="bg-rose-600">Ocupada</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {hasOrder ? (
                          <div className="space-y-3">
                            <div className="flex justify-between items-start mb-1">
                              <div className="font-medium">Pedido #{tableOrder.orderNumber || tableOrder.id}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(tableOrder.timestamp)} • {getElapsedTime(tableOrder.timestamp)}
                              </div>
                            </div>
                            <div className="text-sm">
                              {tableOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between mb-1">
                                  <span>
                                    {item.quantity}x {item.menuItem.name}
                                  </span>
                                  <span>S/ {item.totalPrice.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between font-medium pt-2 border-t">
                              <span>Total:</span>
                              <span>S/ {tableOrder.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              {tableOrder.status === "pending" && (
                                <Button
                                  size="sm"
                                  className="bg-amber-500 hover:bg-amber-600"
                                  onClick={() => handleOrderStatus(tableOrder.id, "preparing")}
                                >
                                  Preparar
                                </Button>
                              )}
                              {tableOrder.status === "preparing" && (
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleOrderStatus(tableOrder.id, "ready")}
                                >
                                  Listo
                                </Button>
                              )}
                              {tableOrder.status === "ready" && (
                                <Button size="sm" onClick={() => handleOrderStatus(tableOrder.id, "delivered")}>
                                  Entregar
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">Mesa ocupada sin pedidos activos</div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </TabsContent>

          <TabsContent value="available">
            <div className="space-y-4">
              {filteredTables
                .filter((table) => table.status === "available")
                .map((table) => (
                  <Card key={table.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Mesa {table.number}</CardTitle>
                          <CardDescription>Capacidad: {table.capacity} personas</CardDescription>
                        </div>
                        <Badge className="bg-green-600">Disponible</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-4 text-muted-foreground">Mesa disponible para nuevos clientes</div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
