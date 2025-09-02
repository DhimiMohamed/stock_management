// app\page.tsx
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats"
import { RecentMovements } from "@/components/dashboard/recent-movements"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { StockAlerts } from "@/components/stock/stock-alerts"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Tableau de Bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre gestion de stock et financière</p>
        </div>

        {/* <DashboardStatsCards /> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* <RecentMovements /> */}
          </div>
          <div className="space-y-6">
            {/* <QuickActions />
            <StockAlerts /> */}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
