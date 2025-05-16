"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  LogOut,
  Store,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Clock,
  Table,
  UtensilsCrossed,
  LayoutGrid,
  Bell,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
// Add import for order utilities
import { getRestaurantOrders, updateOrderStatus, initOrderSync, setupOrderPolling } from "@/lib/order-utils"

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
  image?: string
}

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

// Datos de ejemplo para menú
const sampleMenuItems: MenuItem[] = [
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
    paymentStatus: "confirmed",
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
  // Nuevo pedido de ejemplo
  {
    id: "1004",
    tableId: "2",
    items: [
      {
        menuItem: {
          id: "4",
          name: "Causa Limeña",
          price: 18.0,
        },
        quantity: 2,
        customizations: {
          Relleno: "Atún",
        },
        totalPrice: 42.0,
      },
      {
        menuItem: {
          id: "5",
          name: "Chicha Morada",
          price: 8.0,
        },
        quantity: 1,
        customizations: {},
        totalPrice: 8.0,
      },
    ],
    total: 50.0,
    status: "pending",
    timestamp: "2025-05-14T15:00:00Z",
    paymentMethod: "qr",
    paymentStatus: "confirmed",
    orderNumber: "D101",
  },
]

// Datos de ejemplo para mesas
const sampleTables: RestaurantTable[] = [
  { id: "table1", number: 1, capacity: 4, status: "available" },
  { id: "table2", number: 2, capacity: 2, status: "occupied", currentOrder: "D101" },
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

export default function AdminDashboardPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(sampleMenuItems)
  const [orders, setOrders] = useState<Order[]>(sampleOrders)
  const [tables, setTables] = useState<RestaurantTable[]>(sampleTables)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("orders")
  const [isAddMenuItemDialogOpen, setIsAddMenuItemDialogOpen] = useState(false)
  const [isEditMenuItemDialogOpen, setIsEditMenuItemDialogOpen] = useState(false)
  const [isDeleteMenuItemDialogOpen, setIsDeleteMenuItemDialogOpen] = useState(false)
  const [isAddTableDialogOpen, setIsAddTableDialogOpen] = useState(false)
  const [isEditTableDialogOpen, setIsEditTableDialogOpen] = useState(false)
  const [isDeleteTableDialogOpen, setIsDeleteTableDialogOpen] = useState(false)
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null)
  const [currentTable, setCurrentTable] = useState<RestaurantTable | null>(null)
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "platos-principales",
    customizable: false,
  })
  const [newTable, setNewTable] = useState({
    number: tables.length + 1,
    capacity: 4,
  })
  const [restaurantInfo, setRestaurantInfo] = useState<any>(null)
  const [hasNotifications, setHasNotifications] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [restaurantId, setRestaurantId] = useState<string | null>(null)

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

  // Simular la recepción de nuevos pedidos cada cierto tiempo
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulación de un 20% de probabilidad de recibir un nuevo pedido
      if (Math.random() < 0.2) {
        const newOrderId = `${Math.floor(1000 + Math.random() * 9000)}`
        const availableTables = tables.filter((t) => t.status === "available")

        if (availableTables.length > 0) {
          const randomTableIndex = Math.floor(Math.random() * availableTables.length)
          const selectedTable = availableTables[randomTableIndex]

          // Crear un nuevo pedido aleatorio
          const randomMenuItem = menuItems[Math.floor(Math.random() * menuItems.length)]
          const quantity = Math.floor(1 + Math.random() * 3)
          const orderNumber = `N${Math.floor(100 + Math.random() * 900)}`

          const newOrder: Order = {
            id: newOrderId,
            tableId: selectedTable.number.toString(),
            restaurantId: restaurantId || "",
            items: [
              {
                menuItem: {
                  id: randomMenuItem.id,
                  name: randomMenuItem.name,
                  price: randomMenuItem.price,
                },
                quantity: quantity,
                customizations: {},
                totalPrice: randomMenuItem.price * quantity,
              },
            ],
            total: randomMenuItem.price * quantity,
            status: "pending",
            timestamp: new Date().toISOString(),
            paymentMethod: ["card", "cash", "qr"][Math.floor(Math.random() * 3)],
            paymentStatus: "confirmed",
            orderNumber: orderNumber,
          }

          // Use our handleOrderUpdate function to process the new order
          handleOrderUpdate("newOrder", newOrder)
        }
      }
    }, 60000) // Cada minuto verifica si hay nuevos pedidos

    return () => clearInterval(interval)
  }, [tables, menuItems, toast, restaurantId])

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated")
    localStorage.removeItem("adminUsername")
    localStorage.removeItem("restaurantId")
    router.push("/")
  }

  // Función para refrescar datos
  const handleRefresh = () => {
    setIsRefreshing(true)

    // Refresh orders from storage
    if (restaurantId) {
      const restaurantOrders = getRestaurantOrders(restaurantId)
      handleOrderUpdate("refresh", restaurantOrders)
    }

    // Update UI state
    setLastRefresh(new Date())
    setIsRefreshing(false)

    toast({
      title: "Datos actualizados",
      description: `Última actualización: ${new Date().toLocaleTimeString()}`,
      variant: "default",
    })
  }

  // Filtrar órdenes por término de búsqueda
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.orderNumber && order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Filtrar menú por término de búsqueda
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Filtrar mesas por término de búsqueda
  const filteredTables = tables.filter(
    (table) =>
      table.number.toString().includes(searchTerm) || table.status.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Agrupar órdenes por estado
  const pendingOrders = filteredOrders.filter((order) => order.status === "pending")
  const preparingOrders = filteredOrders.filter((order) => order.status === "preparing")
  const readyOrders = filteredOrders.filter((order) => order.status === "ready")
  const deliveredOrders = filteredOrders.filter((order) => order.status === "delivered")

  // Agrupar mesas por estado
  const availableTables = filteredTables.filter((table) => table.status === "available")
  const occupiedTables = filteredTables.filter((table) => table.status === "occupied")

  // Función para actualizar el estado de una orden
  // Update the handleOrderStatus function
  const handleOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    // Use the utility function to update the order status
    updateOrderStatus(orderId, newStatus)

    // Update local state
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

    // Mostrar notificación de actualización
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

    // Si el pedido se marca como entregado, liberar la mesa
    if (newStatus === "delivered") {
      const order = orders.find((o) => o.id === orderId)
      if (order && order.orderNumber) {
        const tableToUpdate = tables.find((t) => t.currentOrder === order.orderNumber)
        if (tableToUpdate) {
          setTables(
            tables.map((t) =>
              t.id === tableToUpdate.id ? { ...t, status: "available" as const, currentOrder: undefined } : t,
            ),
          )
        }
      }
    }
  }

  // Función para confirmar el pago de una orden
  const confirmPayment = (orderId: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, paymentStatus: "confirmed" } : order)))

    toast({
      title: "Pago confirmado",
      description: `El pago del pedido #${orderId} ha sido confirmado`,
      variant: "default",
    })
  }

  // Función para añadir un nuevo elemento al menú
  const handleAddMenuItem = () => {
    const newId = `item${Math.floor(1000 + Math.random() * 9000)}`
    const newItem: MenuItem = {
      id: newId,
      name: newMenuItem.name || "",
      description: newMenuItem.description || "",
      price: newMenuItem.price || 0,
      category: newMenuItem.category || "platos-principales",
      customizable: newMenuItem.customizable || false,
    }

    setMenuItems([...menuItems, newItem])
    setIsAddMenuItemDialogOpen(false)
    setNewMenuItem({
      name: "",
      description: "",
      price: 0,
      category: "platos-principales",
      customizable: false,
    })

    toast({
      title: "Platillo añadido",
      description: `${newItem.name} ha sido añadido al menú`,
      variant: "default",
    })
  }

  // Función para actualizar un elemento del menú
  const handleUpdateMenuItem = () => {
    if (!currentMenuItem) return

    setMenuItems(menuItems.map((item) => (item.id === currentMenuItem.id ? currentMenuItem : item)))
    setIsEditMenuItemDialogOpen(false)
    setCurrentMenuItem(null)

    toast({
      title: "Platillo actualizado",
      description: `${currentMenuItem.name} ha sido actualizado`,
      variant: "default",
    })
  }

  // Función para eliminar un elemento del menú
  const handleDeleteMenuItem = () => {
    if (!currentMenuItem) return

    setMenuItems(menuItems.filter((item) => item.id !== currentMenuItem.id))
    setIsDeleteMenuItemDialogOpen(false)

    toast({
      title: "Platillo eliminado",
      description: `${currentMenuItem.name} ha sido eliminado del menú`,
      variant: "default",
    })

    setCurrentMenuItem(null)
  }

  // Función para añadir una nueva mesa
  const handleAddTable = () => {
    const newId = `table${Math.floor(1000 + Math.random() * 9000)}`
    const newTableItem: RestaurantTable = {
      id: newId,
      number: newTable.number,
      capacity: newTable.capacity,
      status: "available",
    }

    setTables([...tables, newTableItem])
    setIsAddTableDialogOpen(false)
    setNewTable({
      number: tables.length + 2,
      capacity: 4,
    })

    toast({
      title: "Mesa añadida",
      description: `Mesa ${newTable.number} ha sido añadida`,
      variant: "default",
    })
  }

  // Función para actualizar una mesa
  const handleUpdateTable = () => {
    if (!currentTable) return

    setTables(tables.map((table) => (table.id === currentTable.id ? currentTable : table)))
    setIsEditTableDialogOpen(false)
    setCurrentTable(null)

    toast({
      title: "Mesa actualizada",
      description: `Mesa ${currentTable.number} ha sido actualizada`,
      variant: "default",
    })
  }

  // Función para eliminar una mesa
  const handleDeleteTable = () => {
    if (!currentTable) return

    setTables(tables.filter((table) => table.id !== currentTable.id))
    setIsDeleteTableDialogOpen(false)
    setCurrentTable(null)

    toast({
      title: "Mesa eliminada",
      description: `Mesa ${currentTable.number} ha sido eliminada`,
      variant: "default",
    })
  }

  // Función para cambiar el estado de una mesa
  const toggleTableStatus = (id: string) => {
    setTables(
      tables.map((table) =>
        table.id === id
          ? {
              ...table,
              status: table.status === "available" ? "occupied" : "available",
              currentOrder: table.status === "available" ? undefined : table.currentOrder,
            }
          : table,
      ),
    )

    const tableToUpdate = tables.find((t) => t.id === id)
    if (tableToUpdate) {
      toast({
        title: "Estado de mesa actualizado",
        description: `Mesa ${tableToUpdate.number} ahora está ${tableToUpdate.status === "available" ? "ocupada" : "disponible"}`,
        variant: "default",
      })
    }
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

  // Función para obtener la orden actual de una mesa
  const getTableOrder = (orderId: string | undefined) => {
    if (!orderId) return null
    return orders.find((order) => order.orderNumber === orderId)
  }

  // Función para leer notificaciones
  const readNotifications = () => {
    setHasNotifications(false)

    toast({
      title: "Notificaciones leídas",
      description: "Has marcado todas las notificaciones como leídas",
      variant: "default",
    })
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
      {/* Header con navbar mejorada */}
      <div className="bg-white dark:bg-gray-950 border-b mb-6 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-3 rounded-lg shadow-lg shadow-rose-200 dark:shadow-rose-900/20 mr-3">
              <Store className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{restaurantInfo.name}</h1>
              <p className="text-muted-foreground">Panel de Administración</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={`Buscar ${
                  activeTab === "orders"
                    ? "pedidos"
                    : activeTab === "menu"
                      ? "menú"
                      : activeTab === "tables_view"
                        ? "mesas"
                        : "mesas"
                }`}
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <div className="relative">
              <Button variant="outline" size="icon" className="rounded-full" onClick={readNotifications}>
                <Bell className="h-5 w-5" />
                {hasNotifications && <span className="absolute top-0 right-0 h-2 w-2 bg-rose-600 rounded-full"></span>}
              </Button>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Barra de navegación mejorada */}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button
            variant={activeTab === "orders" ? "default" : "outline"}
            className={activeTab === "orders" ? "bg-rose-600 hover:bg-rose-700" : ""}
            onClick={() => setActiveTab("orders")}
          >
            <UtensilsCrossed className="mr-2 h-4 w-4" />
            Pedidos
            {pendingOrders.length > 0 && <Badge className="ml-2 bg-white text-rose-600">{pendingOrders.length}</Badge>}
          </Button>

          <Button
            variant={activeTab === "tables_view" ? "default" : "outline"}
            className={activeTab === "tables_view" ? "bg-rose-600 hover:bg-rose-700" : ""}
            onClick={() => setActiveTab("tables_view")}
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Vista de Mesas
          </Button>

          <Button
            variant={activeTab === "menu" ? "default" : "outline"}
            className={activeTab === "menu" ? "bg-rose-600 hover:bg-rose-700" : ""}
            onClick={() => setActiveTab("menu")}
          >
            <Store className="mr-2 h-4 w-4" />
            Menú
          </Button>

          <Button
            variant={activeTab === "tables" ? "default" : "outline"}
            className={activeTab === "tables" ? "bg-rose-600 hover:bg-rose-700" : ""}
            onClick={() => setActiveTab("tables")}
          >
            <Table className="mr-2 h-4 w-4" />
            Gestión de Mesas
          </Button>

          <Link href="/admin/estado-mesas" className="ml-auto">
            <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700">
              <LayoutGrid className="mr-2 h-4 w-4" />
              Vista Completa de Mesas
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-4">
        <Card className="p-4 flex items-center gap-3 flex-1 border-l-4 border-l-rose-500">
          <div className="bg-rose-100 dark:bg-rose-900/50 p-3 rounded-full">
            <CreditCard className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ventas Hoy</p>
            <p className="text-2xl font-bold">S/ {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 flex-1 border-l-4 border-l-green-500">
          <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
            <UtensilsCrossed className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pedidos Hoy</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 flex-1 border-l-4 border-l-blue-500">
          <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
            <Table className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mesas Activas</p>
            <p className="text-2xl font-bold">
              {occupiedTables.length}/{tables.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Contenido de Vista de Mesas */}
      {activeTab === "tables_view" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-rose-600" />
              Vista de Mesas y Pedidos Activos
            </h2>
            <div className="text-sm text-muted-foreground">
              Última actualización: {lastRefresh.toLocaleTimeString()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tables.map((table) => {
              const tableOrder = getTableOrder(table.currentOrder)
              const orderStatus = tableOrder?.status || "none"

              // Determinar el color del borde según el estado de la orden
              let borderColor = "border-gray-200 dark:border-gray-800"
              let statusBadge = null

              if (table.status === "occupied") {
                if (orderStatus === "pending") {
                  borderColor = "border-amber-200 dark:border-amber-800"
                  statusBadge = <Badge className="bg-amber-500">Pendiente</Badge>
                } else if (orderStatus === "preparing") {
                  borderColor = "border-blue-200 dark:border-blue-800"
                  statusBadge = <Badge className="bg-blue-500">En Preparación</Badge>
                } else if (orderStatus === "ready") {
                  borderColor = "border-green-200 dark:border-green-800"
                  statusBadge = <Badge className="bg-green-600">Listo para servir</Badge>
                } else {
                  borderColor = "border-rose-200 dark:border-rose-800"
                  statusBadge = <Badge className="bg-rose-600">Ocupada</Badge>
                }
              }

              return (
                <Card
                  key={table.id}
                  className={`overflow-hidden ${borderColor} relative hover:shadow-md transition-shadow`}
                >
                  <CardHeader
                    className={`pb-3 ${table.status === "occupied" ? "bg-rose-50 dark:bg-rose-950/20" : "bg-gray-50 dark:bg-gray-950/50"}`}
                  >
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">Mesa {table.number}</CardTitle>
                      {table.status === "available" ? <Badge className="bg-green-600">Disponible</Badge> : statusBadge}
                    </div>
                    <CardDescription>Capacidad: {table.capacity} personas</CardDescription>
                  </CardHeader>

                  {table.status === "occupied" && tableOrder ? (
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Pedido:</span>
                        <span className="font-semibold text-rose-600">{tableOrder.orderNumber}</span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-auto">
                        {tableOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {item.quantity}x {item.menuItem.name}
                            </span>
                            <span>S/ {item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t pt-2 flex justify-between font-bold">
                          <span>Total:</span>
                          <span>S/ {tableOrder.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        {tableOrder.status === "pending" && (
                          <Button
                            size="sm"
                            className="bg-amber-500 hover:bg-amber-600"
                            onClick={() => handleOrderStatus(tableOrder.id, "preparing")}
                          >
                            <ChefHat className="mr-1 h-3.5 w-3.5" />
                            Preparar
                          </Button>
                        )}
                        {tableOrder.status === "preparing" && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleOrderStatus(tableOrder.id, "ready")}
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                            Listo
                          </Button>
                        )}
                        {tableOrder.status === "ready" && (
                          <Button size="sm" onClick={() => handleOrderStatus(tableOrder.id, "delivered")}>
                            <Clock className="mr-1 h-3.5 w-3.5" />
                            Entregar
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  ) : (
                    <CardContent className="p-4 text-center text-muted-foreground">
                      {table.status === "available" ? "Mesa disponible" : "No hay información de la orden"}
                    </CardContent>
                  )}

                  <CardFooter className="p-3 bg-gray-50 dark:bg-gray-950/50">
                    {table.status === "available" ? (
                      <Button
                        size="sm"
                        className="w-full bg-rose-600 hover:bg-rose-700"
                        onClick={() => toggleTableStatus(table.id)}
                      >
                        Marcar Ocupada
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => toggleTableStatus(table.id)}
                      >
                        Liberar Mesa
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Contenido de Pedidos */}
      {activeTab === "orders" && (
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
                <Card key={order.id} className="border-l-4 border-l-rose-500 overflow-hidden">
                  <CardHeader className="pb-2 bg-rose-50/50 dark:bg-rose-950/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          Pedido #{order.orderNumber || order.id}
                          <Badge className="ml-2 bg-rose-600">Pendiente</Badge>
                          {order.paymentStatus === "pending" && (
                            <Badge className="ml-2 bg-amber-500">Pago Pendiente</Badge>
                          )}
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
                  <CardContent className="pt-4">
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
                  <CardFooter className="flex justify-between bg-gray-50 dark:bg-gray-950/50">
                    {order.paymentStatus === "pending" && (
                      <Button variant="outline" onClick={() => confirmPayment(order.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Confirmar Pago
                      </Button>
                    )}
                    <Button
                      className={`${order.paymentStatus === "pending" ? "ml-auto" : "w-full"} bg-amber-500 hover:bg-amber-600`}
                      onClick={() => handleOrderStatus(order.id, "preparing")}
                      disabled={order.paymentStatus === "pending"}
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
                <Card key={order.id} className="border-l-4 border-l-amber-500 overflow-hidden">
                  <CardHeader className="pb-2 bg-amber-50/50 dark:bg-amber-950/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          Pedido #{order.orderNumber || order.id}
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
                  <CardContent className="pt-4">
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
                  <CardFooter className="bg-gray-50 dark:bg-gray-950/50">
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleOrderStatus(order.id, "ready")}
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
                <Card key={order.id} className="border-l-4 border-l-green-500 overflow-hidden">
                  <CardHeader className="pb-2 bg-green-50/50 dark:bg-green-950/10">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          Pedido #{order.orderNumber || order.id}
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
                  <CardContent className="pt-4">
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
                  <CardFooter className="bg-gray-50 dark:bg-gray-950/50">
                    <Button className="w-full" onClick={() => handleOrderStatus(order.id, "delivered")}>
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
                <Card
                  key={order.id}
                  className="opacity-70 border-l-4 border-l-gray-300 dark:border-l-gray-700 overflow-hidden"
                >
                  <CardHeader className="pb-2 bg-gray-50 dark:bg-gray-950/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center">
                          Pedido #{order.orderNumber || order.id}
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
                  <CardContent className="pt-4">
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
      )}

      {/* Rest of the component remains the same */}
    </div>
  )
}
