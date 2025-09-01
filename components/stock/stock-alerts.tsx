"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, RefreshCw } from "lucide-react"

export function StockAlerts() {
  const [alerts, setAlerts] = useState<Array<Product & { currentStock: number }>>([])
  const [loading, setLoading] = useState(true)

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const [products, stockEntries] = await Promise.all([dataService.getProducts(), dataService.getStockEntries()])

      const alertProducts = products
        .map((product) => {
          const latestEntry = stockEntries
            .filter((entry) => entry.productId === product.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

          const currentStock = latestEntry?.currentStock || 0
          return { ...product, currentStock }
        })
        .filter((product) => product.currentStock <= product.minStock)

      setAlerts(alertProducts)
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Chargement des alertes...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Alertes Stock
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={loadAlerts} className="h-8 w-8 p-0">
          <RefreshCw className="h-3 w-3" />
        </Button>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Package className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Aucune alerte de stock</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.category?.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-xs">
                    <div className="font-medium">Stock: {product.currentStock}</div>
                    <div className="text-muted-foreground">Min: {product.minStock}</div>
                  </div>
                  <Badge variant={product.currentStock === 0 ? "destructive" : "secondary"} className="text-xs">
                    {product.currentStock === 0 ? "Rupture" : "Faible"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
