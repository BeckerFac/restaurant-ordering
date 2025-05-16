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

// Function to save an order and notify all tabs
export function saveOrder(order: Order): void {
  const orders = getOrders()
  const updatedOrders = [...orders, order]
  localStorage.setItem('orders', JSON.stringify(updatedOrders))
  
  // Dispatch event for same-tab listeners
  const event = new CustomEvent('newOrderPlaced', {
    detail: { order }
  })
  window.dispatchEvent(event)
  
  // Force storage event for other tabs
  localStorage.setItem('orders', JSON.stringify(updatedOrders))
}

// Function to get all orders
export function getOrders(): Order[] {
  return JSON.parse(localStorage.getItem("orders") || "[]")
}

// Function to get orders for a specific restaurant
export function getRestaurantOrders(restaurantId: string): Order[] {
  const allOrders = getOrders()
  return allOrders.filter((order) => order.restaurantId === restaurantId)
}

// Function to update order status and notify all tabs
export function updateOrderStatus(orderId: string, newStatus: string, order?: Order) {
  const orders = getOrders()
  const updatedOrders = orders.map(o => 
    o.id === orderId ? { ...o, status: newStatus } : o
  )
  localStorage.setItem('orders', JSON.stringify(updatedOrders))
  
  // Dispatch event for same-tab listeners
  const event = new CustomEvent('orderStatusUpdated', {
    detail: { orderId, newStatus, order }
  })
  window.dispatchEvent(event)
  
  // Force storage event for other tabs
  localStorage.setItem('orders', JSON.stringify(updatedOrders))
}

// Function to generate a unique order number
export function generateOrderNumber(): string {
  return `A${Math.floor(1000 + Math.random() * 9000)}`
}

// Function to initialize order synchronization
export function initOrderSync(callback: (updateType: string, data: any) => void) {
  // Set up storage event listener for cross-tab communication
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'orders') {
      try {
        const orders = JSON.parse(e.newValue || '[]')
        callback('refresh', orders)
      } catch (error) {
        console.error('Error parsing orders from storage:', error)
      }
    }
  }

  window.addEventListener('storage', handleStorageChange)

  // Set up custom event listeners for same-tab communication
  const handleNewOrder = (event: CustomEvent) => {
    callback('newOrder', event.detail.order)
  }

  const handleStatusUpdate = (event: CustomEvent) => {
    callback('statusUpdate', event.detail)
  }

  window.addEventListener('newOrderPlaced', handleNewOrder as EventListener)
  window.addEventListener('orderStatusUpdated', handleStatusUpdate as EventListener)

  return () => {
    window.removeEventListener('storage', handleStorageChange)
    window.removeEventListener('newOrderPlaced', handleNewOrder as EventListener)
    window.removeEventListener('orderStatusUpdated', handleStatusUpdate as EventListener)
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
