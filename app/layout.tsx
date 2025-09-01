import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/layout/sidebar"
import { Suspense } from "react"
import { AuthProvider } from "@/components/auth/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "StockManager - Gestion de Stock et Financière",
  description: "Application de gestion de stock et suivi financier",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}

function AppContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <Sidebar />
      </Suspense>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
