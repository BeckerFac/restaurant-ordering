import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthGuard } from "@/components/auth-guard"
import '../../styles/globals.css'

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthGuard type="superadmin">{children}</AuthGuard>
    </ThemeProvider>
  )
}
