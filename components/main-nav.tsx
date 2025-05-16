"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Store, UtensilsCrossed, Table, LayoutGrid, User, Clock } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const isAdmin = pathname.includes("/admin")
  const isSuperAdmin = pathname.includes("/superadmin")

  if (isAdmin) {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/admin/dashboard" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname === "/admin/dashboard" && "bg-accent text-accent-foreground",
                )}
              >
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                Pedidos
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/admin/estado-mesas" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname === "/admin/estado-mesas" && "bg-accent text-accent-foreground",
                )}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Estado de Mesas
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/admin/reservas" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname === "/admin/reservas" && "bg-accent text-accent-foreground",
                )}
              >
                <Clock className="mr-2 h-4 w-4" />
                Reservas
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )
  }

  if (isSuperAdmin) {
    return (
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <Link href="/superadmin/dashboard" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname === "/superadmin/dashboard" && "bg-accent text-accent-foreground",
                )}
              >
                <Store className="mr-2 h-4 w-4" />
                Restaurantes
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link href="/superadmin/usuarios" legacyBehavior passHref>
              <NavigationMenuLink
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname === "/superadmin/usuarios" && "bg-accent text-accent-foreground",
                )}
              >
                <User className="mr-2 h-4 w-4" />
                Usuarios
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), pathname === "/" && "bg-accent text-accent-foreground")}
            >
              Inicio
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/restaurantes" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === "/restaurantes" && "bg-accent text-accent-foreground",
              )}
            >
              <Store className="mr-2 h-4 w-4" />
              Restaurantes
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/reservas" legacyBehavior passHref>
            <NavigationMenuLink
              className={cn(
                navigationMenuTriggerStyle(),
                pathname === "/reservas" && "bg-accent text-accent-foreground",
              )}
            >
              <Table className="mr-2 h-4 w-4" />
              Reservas
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}
