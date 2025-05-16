// Almacén centralizado para gestionar la autenticación y credenciales
// Este archivo simula una base de datos para nuestro prototipo

// Tipos para nuestros datos
export interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  email: string
  tables: number
  adminUsername: string
  adminPassword: string
  status: "active" | "inactive"
  createdAt: string
}

// Datos iniciales de restaurantes
const initialRestaurants: Restaurant[] = [
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

// Clave para almacenar los datos en localStorage
const RESTAURANTS_STORAGE_KEY = "restaurant_system_data"

// Función para inicializar el almacén si no existe
export function initializeAuthStore(): void {
  if (typeof window === "undefined") return

  // Verificar si ya existen datos en localStorage
  const existingData = localStorage.getItem(RESTAURANTS_STORAGE_KEY)

  if (!existingData) {
    // Si no hay datos, inicializar con los datos predeterminados
    localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(initialRestaurants))
  }
}

// Función para obtener todos los restaurantes
export function getAllRestaurants(): Restaurant[] {
  if (typeof window === "undefined") return initialRestaurants

  initializeAuthStore()
  const data = localStorage.getItem(RESTAURANTS_STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

// Función para obtener un restaurante por ID
export function getRestaurantById(id: string): Restaurant | undefined {
  const restaurants = getAllRestaurants()
  return restaurants.find((restaurant) => restaurant.id === id)
}

// Función para actualizar un restaurante
export function updateRestaurant(updatedRestaurant: Restaurant): boolean {
  try {
    const restaurants = getAllRestaurants()
    const index = restaurants.findIndex((r) => r.id === updatedRestaurant.id)

    if (index === -1) return false

    restaurants[index] = updatedRestaurant
    localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(restaurants))

    // Emitir un evento para notificar a otros componentes sobre el cambio
    const event = new CustomEvent("restaurantDataUpdated", {
      detail: { restaurantId: updatedRestaurant.id },
    })
    window.dispatchEvent(event)

    return true
  } catch (error) {
    console.error("Error al actualizar el restaurante:", error)
    return false
  }
}

// Función para verificar credenciales de administrador
export function verifyAdminCredentials(username: string, password: string): Restaurant | null {
  const restaurants = getAllRestaurants()
  const restaurant = restaurants.find(
    (r) => r.adminUsername === username && r.adminPassword === password && r.status === "active",
  )

  return restaurant || null
}

// Función para verificar credenciales de superadmin (simplificada para demo)
export function verifySuperadminCredentials(username: string, password: string): boolean {
  // En un sistema real, estas credenciales estarían en una base de datos segura
  return username === "superadmin" && password === "super123"
}

// Función para añadir un nuevo restaurante
export function addRestaurant(newRestaurant: Omit<Restaurant, "id" | "createdAt">): Restaurant {
  const restaurants = getAllRestaurants()

  const restaurant: Restaurant = {
    ...newRestaurant,
    id: `rest${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
  }

  restaurants.push(restaurant)
  localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(restaurants))

  return restaurant
}

// Función para eliminar un restaurante
export function deleteRestaurant(id: string): boolean {
  try {
    const restaurants = getAllRestaurants()
    const filteredRestaurants = restaurants.filter((r) => r.id !== id)

    if (filteredRestaurants.length === restaurants.length) return false

    localStorage.setItem(RESTAURANTS_STORAGE_KEY, JSON.stringify(filteredRestaurants))
    return true
  } catch (error) {
    console.error("Error al eliminar el restaurante:", error)
    return false
  }
}
