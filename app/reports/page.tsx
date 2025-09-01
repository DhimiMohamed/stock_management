import { StockReport } from "@/components/reports/stock-report"
import { FinancialReport } from "@/components/reports/financial-report"
import { MovementReport } from "@/components/reports/movement-report"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Rapports et Analyses</h1>
          <p className="text-muted-foreground">Générez et exportez des rapports détaillés de votre activité</p>
        </div>

        <Tabs defaultValue="stock" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stock">Rapport Stock</TabsTrigger>
            <TabsTrigger value="financial">Rapport Financier</TabsTrigger>
            <TabsTrigger value="movements">Mouvements</TabsTrigger>
          </TabsList>

          <TabsContent value="stock" className="space-y-6">
            <StockReport />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialReport />
          </TabsContent>

          <TabsContent value="movements" className="space-y-6">
            <MovementReport />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
