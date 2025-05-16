"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, LogOut, Edit, Trash2, Store, Key, Users, ShieldCheck, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { getAllRestaurants, updateRestaurant, addRestaurant, deleteRestaurant, type Restaurant } from "@/lib/auth-store"

export default function SuperadminDashboardPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = useState(false)
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null)
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    tables: 10,
    adminUsername: "",
    adminPassword: "",
    status: "active" as const,
  })

  const router = useRouter()
  const { toast } = useToast()

  // Cargar datos de restaurantes
  useEffect(() => {
    const loadRestaurants = () => {
      const data = getAllRestaurants()
      setRestaurants(data)
    }

    loadRestaurants()

    // Escuchar eventos de actualización de datos
    window.addEventListener("restaurantDataUpdated", loadRestaurants)

    return () => {
      window.removeEventListener("restaurantDataUpdated", loadRestaurants)
    }
  }, [])

  // Verificar autenticación al cargar la página
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("superadminAuthenticated") === "true"
    if (!isAuthenticated) {
      router.push("/superadmin/login")
    }
  }, [router])

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("superadminAuthenticated")
    router.push("/superadmin/login")
  }

  // Filtrar restaurantes por término de búsqueda
  const filteredRestaurants = restaurants.filter(
    (restaurant) =>
      restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Agrupar restaurantes por estado
  const activeRestaurants = filteredRestaurants.filter((r) => r.status === "active")
  const inactiveRestaurants = filteredRestaurants.filter((r) => r.status === "inactive")

  // Función para añadir un nuevo restaurante
  const handleAddRestaurant = () => {
    try {
      const restaurant = addRestaurant(newRestaurant)

      toast({
        title: "Restaurante añadido",
        description: `${restaurant.name} ha sido añadido correctamente`,
        variant: "default",
      })

      setIsAddDialogOpen(false)
      setNewRestaurant({
        name: "",
        address: "",
        phone: "",
        email: "",
        tables: 10,
        adminUsername: "",
        adminPassword: "",
        status: "active",
      })

      // Actualizar la lista de restaurantes
      setRestaurants(getAllRestaurants())
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo añadir el restaurante",
        variant: "destructive",
      })
    }
  }

  // Función para actualizar un restaurante
  const handleUpdateRestaurant = () => {
    if (!currentRestaurant) return

    try {
      const success = updateRestaurant(currentRestaurant)

      if (success) {
        toast({
          title: "Restaurante actualizado",
          description: `${currentRestaurant.name} ha sido actualizado correctamente`,
          variant: "default",
        })

        setIsEditDialogOpen(false)
        setIsCredentialsDialogOpen(false)
        setCurrentRestaurant(null)

        // Actualizar la lista de restaurantes
        setRestaurants(getAllRestaurants())
      } else {
        throw new Error("No se pudo actualizar el restaurante")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el restaurante",
        variant: "destructive",
      })
    }
  }

  // Función para eliminar un restaurante
  const handleDeleteRestaurant = () => {
    if (!currentRestaurant) return

    try {
      const success = deleteRestaurant(currentRestaurant.id)

      if (success) {
        toast({
          title: "Restaurante eliminado",
          description: `${currentRestaurant.name} ha sido eliminado correctamente`,
          variant: "default",
        })

        setIsDeleteDialogOpen(false)
        setCurrentRestaurant(null)

        // Actualizar la lista de restaurantes
        setRestaurants(getAllRestaurants())
      } else {
        throw new Error("No se pudo eliminar el restaurante")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el restaurante",
        variant: "destructive",
      })
    }
  }

  // Función para cambiar el estado de un restaurante
  const toggleRestaurantStatus = (id: string) => {
    const restaurant = restaurants.find((r) => r.id === id)
    if (!restaurant) return

    const updatedRestaurant = {
      ...restaurant,
      status: restaurant.status === "active" ? "inactive" : "active",
    }

    try {
      const success = updateRestaurant(updatedRestaurant)

      if (success) {
        toast({
          title: "Estado actualizado",
          description: `El restaurante ahora está ${updatedRestaurant.status === "active" ? "activo" : "inactivo"}`,
          variant: "default",
        })

        // Actualizar la lista de restaurantes
        setRestaurants(getAllRestaurants())
      } else {
        throw new Error("No se pudo actualizar el estado del restaurante")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del restaurante",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Toaster />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <ShieldCheck className="h-8 w-8 text-rose-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Panel de Superadmin</h1>
            <p className="text-muted-foreground">Gestión global de restaurantes</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar restaurante"
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-4">
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-rose-100 dark:bg-rose-900 p-3 rounded-full">
              <Store className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Restaurantes</p>
              <p className="text-2xl font-bold">{restaurants.length}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Restaurantes Activos</p>
              <p className="text-2xl font-bold">{activeRestaurants.length}</p>
            </div>
          </Card>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Restaurante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Restaurante</DialogTitle>
              <DialogDescription>
                Completa los detalles para crear un nuevo restaurante en el sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Restaurante</Label>
                  <Input
                    id="name"
                    value={newRestaurant.name}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, name: e.target.value })}
                    placeholder="Nombre del restaurante"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tables">Número de Mesas</Label>
                  <Input
                    id="tables"
                    type="number"
                    value={newRestaurant.tables}
                    onChange={(e) =>
                      setNewRestaurant({ ...newRestaurant, tables: Number.parseInt(e.target.value) || 0 })
                    }
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newRestaurant.address}
                  onChange={(e) => setNewRestaurant({ ...newRestaurant, address: e.target.value })}
                  placeholder="Dirección completa"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newRestaurant.phone}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, phone: e.target.value })}
                    placeholder="Número de teléfono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newRestaurant.email}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, email: e.target.value })}
                    placeholder="Email de contacto"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminUsername">Usuario Administrador</Label>
                  <Input
                    id="adminUsername"
                    value={newRestaurant.adminUsername}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, adminUsername: e.target.value })}
                    placeholder="Nombre de usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Contraseña</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={newRestaurant.adminPassword}
                    onChange={(e) => setNewRestaurant({ ...newRestaurant, adminPassword: e.target.value })}
                    placeholder="Contraseña segura"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleAddRestaurant}>
                Guardar Restaurante
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="relative">
            Activos
            {activeRestaurants.length > 0 && <Badge className="ml-2 bg-green-600">{activeRestaurants.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="inactive" className="relative">
            Inactivos
            {inactiveRestaurants.length > 0 && <Badge className="ml-2 bg-gray-500">{inactiveRestaurants.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeRestaurants.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Store className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay restaurantes activos</p>
              </CardContent>
            </Card>
          ) : (
            activeRestaurants.map((restaurant) => (
              <Card key={restaurant.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {restaurant.name}
                        <Badge className="ml-2 bg-green-600">Activo</Badge>
                      </CardTitle>
                      <CardDescription>ID: {restaurant.id}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{restaurant.tables} mesas</div>
                      <div className="text-sm text-muted-foreground">{restaurant.phone}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Dirección:</p>
                      <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email:</p>
                      <p className="text-sm text-muted-foreground">{restaurant.email}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex gap-2">
                    <Dialog
                      open={isEditDialogOpen && currentRestaurant?.id === restaurant.id}
                      onOpenChange={(open) => {
                        setIsEditDialogOpen(open)
                        if (!open) setCurrentRestaurant(null)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentRestaurant(restaurant)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Editar Restaurante</DialogTitle>
                          <DialogDescription>Modifica los detalles del restaurante.</DialogDescription>
                        </DialogHeader>
                        {currentRestaurant && (
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-name">Nombre del Restaurante</Label>
                                <Input
                                  id="edit-name"
                                  value={currentRestaurant.name}
                                  onChange={(e) =>
                                    setCurrentRestaurant({
                                      ...currentRestaurant,
                                      name: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-tables">Número de Mesas</Label>
                                <Input
                                  id="edit-tables"
                                  type="number"
                                  value={currentRestaurant.tables}
                                  onChange={(e) =>
                                    setCurrentRestaurant({
                                      ...currentRestaurant,
                                      tables: Number.parseInt(e.target.value) || 0,
                                    })
                                  }
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edit-address">Dirección</Label>
                              <Input
                                id="edit-address"
                                value={currentRestaurant.address}
                                onChange={(e) =>
                                  setCurrentRestaurant({
                                    ...currentRestaurant,
                                    address: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="edit-phone">Teléfono</Label>
                                <Input
                                  id="edit-phone"
                                  value={currentRestaurant.phone}
                                  onChange={(e) =>
                                    setCurrentRestaurant({
                                      ...currentRestaurant,
                                      phone: e.target.value,
                                    })
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input
                                  id="edit-email"
                                  type="email"
                                  value={currentRestaurant.email}
                                  onChange={(e) =>
                                    setCurrentRestaurant({
                                      ...currentRestaurant,
                                      email: e.target.value,
                                    })
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleUpdateRestaurant}>
                            Guardar Cambios
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={isCredentialsDialogOpen && currentRestaurant?.id === restaurant.id}
                      onOpenChange={(open) => {
                        setIsCredentialsDialogOpen(open)
                        if (!open) setCurrentRestaurant(null)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentRestaurant(restaurant)
                            setIsCredentialsDialogOpen(true)
                          }}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Credenciales
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Credenciales de Administrador</DialogTitle>
                          <DialogDescription>
                            Gestiona las credenciales de acceso para este restaurante.
                          </DialogDescription>
                        </DialogHeader>
                        {currentRestaurant && (
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="admin-username">Usuario Administrador</Label>
                              <Input
                                id="admin-username"
                                value={currentRestaurant.adminUsername}
                                onChange={(e) =>
                                  setCurrentRestaurant({
                                    ...currentRestaurant,
                                    adminUsername: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="admin-password">Nueva Contraseña</Label>
                              <Input
                                id="admin-password"
                                type="password"
                                value={currentRestaurant.adminPassword}
                                onChange={(e) =>
                                  setCurrentRestaurant({
                                    ...currentRestaurant,
                                    adminPassword: e.target.value,
                                  })
                                }
                                placeholder="Ingresa la nueva contraseña"
                              />
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                  <p className="font-medium">Importante:</p>
                                  <p>
                                    Al actualizar estas credenciales, el administrador del restaurante deberá usar las
                                    nuevas credenciales para iniciar sesión. Las credenciales anteriores dejarán de
                                    funcionar inmediatamente.
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsCredentialsDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button className="bg-rose-600 hover:bg-rose-700" onClick={handleUpdateRestaurant}>
                            Actualizar Credenciales
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={isDeleteDialogOpen && currentRestaurant?.id === restaurant.id}
                      onOpenChange={(open) => {
                        setIsDeleteDialogOpen(open)
                        if (!open) setCurrentRestaurant(null)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                          onClick={() => {
                            setCurrentRestaurant(restaurant)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Confirmar Eliminación</DialogTitle>
                          <DialogDescription>
                            ¿Estás seguro de que deseas eliminar este restaurante? Esta acción no se puede deshacer.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancelar
                          </Button>
                          <Button variant="destructive" onClick={handleDeleteRestaurant}>
                            Eliminar Restaurante
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Button variant="outline" onClick={() => toggleRestaurantStatus(restaurant.id)}>
                    Desactivar
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          {inactiveRestaurants.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Store className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay restaurantes inactivos</p>
              </CardContent>
            </Card>
          ) : (
            inactiveRestaurants.map((restaurant) => (
              <Card key={restaurant.id} className="opacity-70">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        {restaurant.name}
                        <Badge className="ml-2" variant="outline">
                          Inactivo
                        </Badge>
                      </CardTitle>
                      <CardDescription>ID: {restaurant.id}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{restaurant.tables} mesas</div>
                      <div className="text-sm text-muted-foreground">{restaurant.phone}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Dirección:</p>
                      <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Email:</p>
                      <p className="text-sm text-muted-foreground">{restaurant.email}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-rose-600 hover:bg-rose-700"
                    onClick={() => toggleRestaurantStatus(restaurant.id)}
                  >
                    Activar Restaurante
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
