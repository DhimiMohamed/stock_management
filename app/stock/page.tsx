"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { StockTable } from "@/components/stock/stock-table"
import { StockMovementForm } from "@/components/stock/stock-movement-form"
import { StockAlerts } from "@/components/stock/stock-alerts"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await dataService.getProducts()
        setProducts(productsData)
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error)
      }
    }

    loadProducts()
  }, [refreshKey])

  const handleMovementAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Gestion du Stock</h1>
            <p className="text-muted-foreground">Suivez et gérez votre inventaire en temps réel</p>
          </div>
          <StockMovementForm products={products} onMovementAdded={handleMovementAdded} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <StockTable
              onAddStock={(productId) => {
                // Could open the movement form with pre-selected product
                console.log("Add stock for product:", productId)
              }}
            />
          </div>
          <div className="lg:col-span-1">
            <StockAlerts />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
