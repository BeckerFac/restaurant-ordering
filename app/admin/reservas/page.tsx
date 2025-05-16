"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, isToday, isTomorrow, addDays, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarIcon,
  Search,
  CheckCircle2,
  X,
  CalendarPlus2Icon as CalendarIcon2,
  Clock,
  Users,
  Phone,
} from "lucide-react"
import Link from "next/link"

// Tipos para nuestros datos
interface Reservation {
  id: string
  name: string
  email: string
  phone: string
  date: Date
  time: string
  guests: number
  notes?: string
  status: "confirmed" | "cancelled" | "completed"
  tableId?: string
}

// Datos de ejemplo para reservas
const sampleReservations: Reservation[] = [
  {
    id: "RES1001",
    name: "Carlos Rodríguez",
    email: "carlos@ejemplo.com",
    phone: "999888777",
    date: addDays(new Date(), 0),
    time: "20:00",
    guests: 4,
    notes: "Celebración de aniversario",
    status: "confirmed",
    tableId: "5",
  },
  {
    id: "RES1002",
    name: "María López",
    email: "maria@ejemplo.com",
    phone: "999777666",
    date: addDays(new Date(), 0),
    time: "21:30",
    guests: 2,
    status: "confirmed",
    tableId: "3",
  },
  {
    id: "RES1003",
    name: "Juan Pérez",
    email: "juan@ejemplo.com",
    phone: "999666555",
    date: addDays(new Date(), 1),
    time: "13:00",
    guests: 6,
    notes: "Mesa cerca de la ventana si es posible",
    status: "confirmed",
    tableId: "8",
  },
  {
    id: "RES1004",
    name: "Ana Gómez",
    email: "ana@ejemplo.com",
    phone: "999555444",
    date: addDays(new Date(), 2),
    time: "14:30",
    guests: 3,
    status: "confirmed",
  },
  {
    id: "RES1005",
    name: "Roberto Sánchez",
    email: "roberto@ejemplo.com",
    phone: "999444333",
    date: addDays(new Date(), -1),
    time: "20:30",
    guests: 2,
    status: "completed",
    tableId: "4",
  },
  {
    id: "RES1006",
    name: "Lucía Martínez",
    email: "lucia@ejemplo.com",
    phone: "999333222",
    date: addDays(new Date(), -2),
    time: "19:00",
    guests: 5,
    notes: "Alergias: mariscos",
    status: "cancelled",
  },
]

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(sampleReservations)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Función para actualizar el estado de una reserva
  const updateReservationStatus = (reservationId: string, newStatus: Reservation["status"]) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) =>
        reservation.id === reservationId ? { ...reservation, status: newStatus } : reservation,
      ),
    )
  }

  // Función para asignar una mesa a una reserva
  const assignTable = (reservationId: string, tableId: string) => {
    setReservations((prevReservations) =>
      prevReservations.map((reservation) =>
        reservation.id === reservationId ? { ...reservation, tableId } : reservation,
      ),
    )
  }

  // Filtrar reservas por término de búsqueda y fecha
  const filteredReservations = reservations.filter(
    (reservation) =>
      (reservation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.phone.includes(searchTerm)) &&
      (selectedDate ? isSameDay(reservation.date, selectedDate) : true),
  )

  // Agrupar reservas por estado
  const confirmedReservations = filteredReservations.filter((r) => r.status === "confirmed")
  const completedReservations = filteredReservations.filter((r) => r.status === "completed")
  const cancelledReservations = filteredReservations.filter((r) => r.status === "cancelled")

  // Función para formatear la fecha
  const formatReservationDate = (date: Date) => {
    if (isToday(date)) {
      return "Hoy"
    } else if (isTomorrow(date)) {
      return "Mañana"
    } else {
      return format(date, "d 'de' MMMM", { locale: es })
    }
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Reservas</h1>
          <p className="text-muted-foreground">Administra las reservas del restaurante</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por código o nombre"
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {selectedDate
            ? `Reservas para ${format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}`
            : "Todas las reservas"}
        </h2>
        <Link href="/admin">
          <Button variant="outline">Volver al Panel</Button>
        </Link>
      </div>

      <Tabs defaultValue="confirmed">
        <TabsList className="mb-4">
          <TabsTrigger value="confirmed" className="relative">
            Confirmadas
            {confirmedReservations.length > 0 && (
              <Badge className="ml-2 bg-rose-600">{confirmedReservations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completadas</TabsTrigger>
          <TabsTrigger value="cancelled">Canceladas</TabsTrigger>
        </TabsList>

        <TabsContent value="confirmed" className="space-y-4">
          {confirmedReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CalendarIcon2 className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay reservas confirmadas para esta fecha</p>
              </CardContent>
            </Card>
          ) : (
            confirmedReservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        Reserva #{reservation.id}
                        <Badge className="ml-2 bg-rose-600">Confirmada</Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatReservationDate(reservation.date)} • {reservation.time} • {reservation.guests}{" "}
                        {reservation.guests === 1 ? "persona" : "personas"}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{reservation.name}</div>
                      <div className="text-sm text-muted-foreground">{reservation.phone}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {reservation.guests} {reservation.guests === 1 ? "persona" : "personas"}
                      </span>
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium">Notas:</p>
                      <p className="text-sm text-muted-foreground">{reservation.notes}</p>
                    </div>
                  )}

                  {!reservation.tableId && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Asignar mesa:</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 10 }, (_, i) => i + 1).map((tableId) => (
                          <Button
                            key={tableId}
                            variant="outline"
                            size="sm"
                            onClick={() => assignTable(reservation.id, tableId.toString())}
                          >
                            Mesa {tableId}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {reservation.tableId && (
                    <div className="mt-4 flex items-center">
                      <span className="text-sm font-medium mr-2">Mesa asignada:</span>
                      <Badge variant="outline">Mesa {reservation.tableId}</Badge>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    className="border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700"
                    onClick={() => updateReservationStatus(reservation.id, "cancelled")}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => updateReservationStatus(reservation.id, "completed")}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Completar
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CalendarIcon2 className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay reservas completadas para esta fecha</p>
              </CardContent>
            </Card>
          ) : (
            completedReservations.map((reservation) => (
              <Card key={reservation.id} className="opacity-70">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        Reserva #{reservation.id}
                        <Badge className="ml-2 bg-green-600">Completada</Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatReservationDate(reservation.date)} • {reservation.time} • {reservation.guests}{" "}
                        {reservation.guests === 1 ? "persona" : "personas"}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{reservation.name}</div>
                      <div className="text-sm text-muted-foreground">{reservation.phone}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {reservation.guests} {reservation.guests === 1 ? "persona" : "personas"}
                      </span>
                    </div>
                  </div>

                  {reservation.tableId && (
                    <div className="mt-4 flex items-center">
                      <span className="text-sm font-medium mr-2">Mesa asignada:</span>
                      <Badge variant="outline">Mesa {reservation.tableId}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CalendarIcon2 className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay reservas canceladas para esta fecha</p>
              </CardContent>
            </Card>
          ) : (
            cancelledReservations.map((reservation) => (
              <Card key={reservation.id} className="opacity-70">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        Reserva #{reservation.id}
                        <Badge className="ml-2" variant="destructive">
                          Cancelada
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {formatReservationDate(reservation.date)} • {reservation.time} • {reservation.guests}{" "}
                        {reservation.guests === 1 ? "persona" : "personas"}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{reservation.name}</div>
                      <div className="text-sm text-muted-foreground">{reservation.phone}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{reservation.time}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>
                        {reservation.guests} {reservation.guests === 1 ? "persona" : "personas"}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-rose-600 hover:bg-rose-700"
                    onClick={() => updateReservationStatus(reservation.id, "confirmed")}
                  >
                    Restaurar Reserva
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
