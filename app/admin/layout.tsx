import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { MainNav } from "@/components/main-nav"
import { AuthGuard } from "@/components/auth-guard"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthGuard type="admin">
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <MainNav />
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </AuthGuard>
    </ThemeProvider>
  )
}
