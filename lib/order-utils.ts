// Types for our order data
export interface OrderItem {
  menuItem: {
    id: string
    name: string
    price: number
  }
  quantity: number
  customizations: Record<string, string>
  totalPrice: number
}

export interface Order {
  id: string
  restaurantId: string
  tableId: string
  items: OrderItem[]
  total: number
  status: "pending" | "preparing" | "ready" | "delivered"
  timestamp: string
  paymentMethod: string
  paymentStatus: "pending" | "confirmed"
  orderNumber?: string
}

// Function to save an order with cross-tab synchronization
export function saveOrder(order: Order): void {
  const existingOrders = getOrders()
  localStorage.setItem("restaurantOrders", JSON.stringify([...existingOrders, order]))

  // Dispatch event for real-time updates within the same tab
  const orderEvent = new CustomEvent("newOrderPlaced", {
    detail: { order },
  })
  window.dispatchEvent(orderEvent)

  // Dispatch a storage event for cross-tab communication
  // We use a separate key for this to avoid conflicts
  localStorage.setItem(
    "lastOrderUpdate",
    JSON.stringify({
      type: "newOrder",
      order,
      timestamp: new Date().getTime(),
    }),
  )
}

// Function to get all orders
export function getOrders(): Order[] {
  return JSON.parse(localStorage.getItem("restaurantOrders") || "[]")
}

// Function to get orders for a specific restaurant
export function getRestaurantOrders(restaurantId: string): Order[] {
  const allOrders = getOrders()
  return allOrders.filter((order) => order.restaurantId === restaurantId)
}

// Function to update an order's status with cross-tab synchronization
export function updateOrderStatus(orderId: string, newStatus: Order["status"]): void {
  const allOrders = getOrders()
  const updatedOrders = allOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order))

  localStorage.setItem("restaurantOrders", JSON.stringify(updatedOrders))

  // Find the updated order for the event detail
  const updatedOrder = updatedOrders.find((order) => order.id === orderId)

  // Dispatch event for real-time updates within the same tab
  const updateEvent = new CustomEvent("orderStatusUpdated", {
    detail: { orderId, newStatus, order: updatedOrder },
  })
  window.dispatchEvent(updateEvent)

  // Dispatch a storage event for cross-tab communication
  localStorage.setItem(
    "lastOrderUpdate",
    JSON.stringify({
      type: "statusUpdate",
      orderId,
      newStatus,
      order: updatedOrder,
      timestamp: new Date().getTime(),
    }),
  )
}

// Function to generate a unique order number
export function generateOrderNumber(): string {
  return `A${Math.floor(1000 + Math.random() * 9000)}`
}

// Function to initialize the order synchronization system
export function initOrderSync(callback: (updateType: string, data: any) => void): () => void {
  // Handler for storage events (cross-tab communication)
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === "lastOrderUpdate" && event.newValue) {
      const update = JSON.parse(event.newValue)

      if (update.type === "newOrder") {
        callback("newOrder", update.order)
      } else if (update.type === "statusUpdate") {
        callback("statusUpdate", {
          orderId: update.orderId,
          newStatus: update.newStatus,
          order: update.order,
        })
      }
    }
  }

  // Add event listener for storage events
  window.addEventListener("storage", handleStorageChange)

  // Return a cleanup function
  return () => {
    window.removeEventListener("storage", handleStorageChange)
  }
}

// Function to set up periodic polling for order updates
export function setupOrderPolling(
  restaurantId: string,
  callback: (orders: Order[]) => void,
  interval = 10000,
): () => void {
  let lastCheck = Date.now()

  const checkForUpdates = () => {
    const currentOrders = getRestaurantOrders(restaurantId)
    callback(currentOrders)
    lastCheck = Date.now()
  }

  const intervalId = setInterval(checkForUpdates, interval)

  // Return a cleanup function
  return () => {
    clearInterval(intervalId)
  }
}
