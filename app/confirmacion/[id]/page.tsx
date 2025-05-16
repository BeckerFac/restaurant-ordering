import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function ConfirmationPage({ params }: { params: { id: string } }) {
  const tableId = params.id

  return (
    <div className="container mx-auto py-10 px-4 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">¡Pedido Confirmado!</CardTitle>
          <CardDescription>Mesa {tableId}</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p>Tu pedido ha sido enviado a la cocina y será preparado en breve.</p>
          <p>El personal del restaurante atenderá tu mesa pronto.</p>
          <div className="border rounded-md p-4 bg-muted/50 mt-4">
            <p className="font-medium">Número de Pedido</p>
            <p className="text-2xl font-bold">
              {Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, "0")}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button className="bg-rose-600 hover:bg-rose-700">Volver al Inicio</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
