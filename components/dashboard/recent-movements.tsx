"use client"

import { useState, useEffect } from "react"
import type { StockMovement } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, Eye } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"

export function RecentMovements() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMovements = async () => {
      try {
        const data = await dataService.getStockMovements()
        // Get the 5 most recent movements
        const recent = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
        setMovements(recent)
      } catch (error) {
        console.error("Erreur lors du chargement des mouvements:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMovements()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Mouvements Récents</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/stock" className="flex items-center gap-2">
            <Eye className="h-3 w-3" />
            Voir tout
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {movements.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucun mouvement récent</p>
          ) : (
            movements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      movement.type === "in" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {movement.type === "in" ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{movement.product?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(movement.date, "dd MMM yyyy à HH:mm", { locale: fr })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-sm">
                    {movement.type === "in" ? "+" : "-"}
                    {movement.quantity}
                  </div>
                  <div className="text-xs text-muted-foreground">{movement.totalValue.toFixed(2)} €</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
