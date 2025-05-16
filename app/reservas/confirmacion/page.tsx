"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Calendar, Clock, Users, CalendarCheck } from "lucide-react"
import Link from "next/link"

interface Reservation {
  name: string
  email: string
  phone: string
  date: string
  dateFormatted: string
  time: string
  guests: string
  notes?: string
}

export default function ConfirmationPage() {
  const [reservation, setReservation] = useState<Reservation | null>(null)

  useEffect(() => {
    // Recuperar datos de reserva desde sessionStorage
    const savedReservation = sessionStorage.getItem("reservation")
    if (savedReservation) {
      setReservation(JSON.parse(savedReservation))
    }
  }, [])

  if (!reservation) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>No se encontró información de reserva</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Por favor, realiza una nueva reserva.</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link href="/reservas">
              <Button className="bg-rose-600 hover:bg-rose-700">Hacer una Reserva</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Generar un código de reserva aleatorio
  const reservationCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  return (
    <div className="container mx-auto py-10 px-4 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Reserva Confirmada!</CardTitle>
          <CardDescription>Tu mesa ha sido reservada con éxito</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-md p-4 bg-muted/50">
            <p className="font-medium text-center">Código de Reserva</p>
            <p className="text-2xl font-bold text-center">{reservationCode}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start">
              <CalendarCheck className="h-5 w-5 mr-3 text-rose-600 mt-0.5" />
              <div>
                <p className="font-medium">Detalles de la Reserva</p>
                <p className="text-muted-foreground">{reservation.name}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Calendar className="h-5 w-5 mr-3 text-rose-600 mt-0.5" />
              <div>
                <p className="font-medium">Fecha</p>
                <p className="text-muted-foreground">{reservation.dateFormatted}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-3 text-rose-600 mt-0.5" />
              <div>
                <p className="font-medium">Hora</p>
                <p className="text-muted-foreground">{reservation.time}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Users className="h-5 w-5 mr-3 text-rose-600 mt-0.5" />
              <div>
                <p className="font-medium">Personas</p>
                <p className="text-muted-foreground">
                  {reservation.guests} {Number.parseInt(reservation.guests) === 1 ? "persona" : "personas"}
                </p>
              </div>
            </div>

            {reservation.notes && (
              <div className="border-t pt-4 mt-4">
                <p className="font-medium">Notas adicionales</p>
                <p className="text-muted-foreground">{reservation.notes}</p>
              </div>
            )}
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/20 p-4 rounded-md text-sm">
            <p className="font-medium mb-2">Información importante</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Por favor, llega 10 minutos antes de tu reserva</li>
              <li>La reserva se mantendrá por 15 minutos después de la hora programada</li>
              <li>Para cancelaciones, contáctanos con al menos 2 horas de anticipación</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Link href="/" className="w-full">
            <Button className="w-full bg-rose-600 hover:bg-rose-700">Volver al Inicio</Button>
          </Link>
          <Button variant="outline" className="w-full" onClick={() => window.print()}>
            Imprimir Confirmación
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
