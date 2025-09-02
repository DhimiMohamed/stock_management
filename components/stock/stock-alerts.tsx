// components/stock/stock-alerts.tsx
"use client"

import { useState, useEffect } from "react"
import type { Product, StockEntry } from "@/lib/types"
import { getProducts, getStockEntries } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, RefreshCw } from "lucide-react"

interface AlertProduct extends Product {
  currentStock: number
  status: "out-of-stock" | "low-stock"
}

export function StockAlerts() {
  const [alertProducts, setAlertProducts] = useState<AlertProduct[]>([])
  const [loading, setLoading] = useState(true)

  const loadAlerts = async () => {
    setLoading(true)
    try {
      const [products, stockEntries] = await Promise.all([
        getProducts(), 
        getStockEntries()
      ])

      const alertProducts = products
        .map((product) => {
          // Get current stock from product.actualStock
          const currentStock = product.actualStock || 0
          
          let status: "out-of-stock" | "low-stock" | null = null
          if (currentStock === 0) {
            status = "out-of-stock"
          } else if (currentStock <= product.minStock) {
            status = "low-stock"
          }

          return status ? { ...product, currentStock, status } : null
        })
        .filter((product): product is AlertProduct => product !== null)
        .sort((a, b) => {
          // Sort by severity: out-of-stock first, then low-stock
          if (a.status === "out-of-stock" && b.status === "low-stock") return -1
          if (a.status === "low-stock" && b.status === "out-of-stock") return 1
          return 0
        })

      setAlertProducts(alertProducts)
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlerts()
  }, [])

  const getAlertBadge = (status: "out-of-stock" | "low-stock") => {
    switch (status) {
      case "out-of-stock":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Rupture de stock
          </Badge>
        )
      case "low-stock":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Stock faible
          </Badge>
        )
    }
  }

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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertes Stock ({alertProducts.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAlerts}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alertProducts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Aucune alerte de stock</p>
            <p className="text-sm">Tous les produits ont un stock suffisant</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.category?.name} • Stock min: {product.minStock}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium">Stock: {product.currentStock}</p>
                    <p className="text-sm text-muted-foreground">
                      Valeur: {(product.currentStock * product.unitPrice).toFixed(2)} €
                    </p>
                  </div>
                  {getAlertBadge(product.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}