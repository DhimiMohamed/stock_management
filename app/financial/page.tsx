"use client"

import { FinancialSummary } from "@/components/financial/financial-summary"
import { FinancialCharts } from "@/components/financial/financial-charts"
import { ProfitLossCalculator } from "@/components/financial/profit-loss-calculator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function FinancialPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Analyse Financière</h1>
          <p className="text-muted-foreground">Suivez la performance financière de votre inventaire</p>
        </div>

        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Résumé</TabsTrigger>
            <TabsTrigger value="charts">Graphiques</TabsTrigger>
            <TabsTrigger value="profitloss">Profit/Perte</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-6">
            <FinancialSummary />
          </TabsContent>

          <TabsContent value="charts" className="space-y-6">
            <FinancialCharts />
          </TabsContent>

          <TabsContent value="profitloss" className="space-y-6">
            <ProfitLossCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
