"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, addDays, isAfter, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { CalendarIcon, ChevronLeft } from "lucide-react"
import Link from "next/link"

// Esquema de validación para el formulario
const reservationSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  email: z.string().email({ message: "Correo electrónico inválido" }),
  phone: z.string().min(9, { message: "Número de teléfono inválido" }),
  date: z.date({
    required_error: "Por favor selecciona una fecha",
  }),
  time: z.string({
    required_error: "Por favor selecciona una hora",
  }),
  guests: z.string({
    required_error: "Por favor selecciona el número de personas",
  }),
  notes: z.string().optional(),
})

type ReservationFormValues = z.infer<typeof reservationSchema>

// Horarios disponibles para reservas
const availableTimes = [
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
]

// Opciones para el número de personas
const guestOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]

// Simulación de mesas ocupadas (en un sistema real, esto vendría de una base de datos)
const bookedTables: { date: string; time: string; tables: number }[] = [
  { date: "2025-05-15", time: "20:00", tables: 3 },
  { date: "2025-05-15", time: "20:30", tables: 4 },
  { date: "2025-05-16", time: "13:00", tables: 5 },
  { date: "2025-05-16", time: "21:00", tables: 6 },
]

export default function ReservationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  // Configurar el formulario con React Hook Form
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      notes: "",
    },
  })

  // Función para verificar disponibilidad en una fecha y hora específicas
  const checkAvailability = (date: string, time: string) => {
    const booking = bookedTables.find((b) => b.date === date && b.time === time)
    // Asumimos que tenemos 10 mesas en total
    const availableTables = booking ? 10 - booking.tables : 10
    return availableTables > 0 ? availableTables : 0
  }

  // Función para filtrar horas disponibles basadas en la fecha seleccionada
  const getAvailableTimesForDate = (date: Date | undefined) => {
    if (!date) return availableTimes

    const dateStr = format(date, "yyyy-MM-dd")
    return availableTimes.filter((time) => {
      const availability = checkAvailability(dateStr, time)
      return availability > 0
    })
  }

  // Función para manejar el envío del formulario
  const onSubmit = async (data: ReservationFormValues) => {
    setIsSubmitting(true)

    // Simulación de envío a un servidor
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // En un sistema real, aquí enviaríamos los datos a una API
    console.log("Datos de reserva:", {
      ...data,
      dateFormatted: format(data.date, "yyyy-MM-dd"),
    })

    // Guardar datos de reserva en sessionStorage para la página de confirmación
    sessionStorage.setItem(
      "reservation",
      JSON.stringify({
        ...data,
        dateFormatted: format(data.date, "dd 'de' MMMM 'de' yyyy", { locale: es }),
      }),
    )

    // Redirigir a la página de confirmación
    router.push("/reservas/confirmacion")
  }

  // Filtrar fechas pasadas y más de 30 días en el futuro
  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thirtyDaysFromNow = addDays(today, 30)
    return isBefore(date, today) || isAfter(date, thirtyDaysFromNow)
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-4">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Reserva de Mesa</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Haz tu reserva</CardTitle>
          <CardDescription>Completa el formulario para reservar una mesa en nuestro restaurante.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <Input placeholder="ejemplo@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input placeholder="999 888 777" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="guests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de personas</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el número de personas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guestOptions.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option} {Number.parseInt(option) === 1 ? "persona" : "personas"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${!field.value && "text-muted-foreground"}`}
                            >
                              {field.value ? (
                                format(field.value, "PPP", { locale: es })
                              ) : (
                                <span>Selecciona una fecha</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date)
                              setSelectedDate(date)
                            }}
                            disabled={isDateDisabled}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hora</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una hora" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableTimesForDate(selectedDate).map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedDate
                          ? "Horarios disponibles para la fecha seleccionada"
                          : "Selecciona primero una fecha"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas adicionales (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Alergias, preferencias, ocasiones especiales..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700" disabled={isSubmitting}>
                {isSubmitting ? "Procesando..." : "Confirmar Reserva"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
