"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Zap, Plus, Minus } from "lucide-react"

export function QuickStockEntry() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [entries, setEntries] = useState<
    Array<{
      productId: string
      type: "in" | "out"
      quantity: number
      notes: string
    }>
  >([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await dataService.getProducts()
        setProducts(data)
      } catch (error) {
        console.error("Erreur lors du chargement des produits:", error)
      }
    }

    loadProducts()
  }, [])

  const addEntry = (type: "in" | "out") => {
    if (!selectedProduct) return

    setEntries((prev) => [
      ...prev,
      {
        productId: selectedProduct.id,
        type,
        quantity: 1,
        notes: `${type === "in" ? "Entrée" : "Sortie"} rapide - ${selectedProduct.name}`,
      },
    ])
  }

  const updateEntry = (index: number, field: string, value: any) => {
    setEntries((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)))
  }

  const removeEntry = (index: number) => {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (entries.length === 0) {
      toast({
        title: "Erreur",
        description: "Aucune entrée à traiter",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      // Process each entry
      for (const entry of entries) {
        const product = products.find((p) => p.id === entry.productId)
        if (!product) continue

        // Get current stock
        const stockEntries = await dataService.getStockEntries()
        const currentEntry = stockEntries
          .filter((se) => se.productId === entry.productId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

        const currentStock = currentEntry?.currentStock || 0
        const newStock =
          entry.type === "in" ? currentStock + entry.quantity : Math.max(0, currentStock - entry.quantity)

        await dataService.createStockEntry({
          productId: entry.productId,
          date: new Date(),
          quantityIn: entry.type === "in" ? entry.quantity : 0,
          quantityOut: entry.type === "out" ? entry.quantity : 0,
          currentStock: newStock,
          unitPrice: product.unitPrice,
          totalValue: newStock * product.unitPrice,
          notes: entry.notes,
        })
      }

      toast({
        title: "Succès",
        description: `${entries.length} mouvements traités avec succès`,
      })

      setEntries([])
      setSelectedProduct(null)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du traitement des mouvements",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Saisie Rapide de Stock
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Select
              value={selectedProduct?.id || ""}
              onValueChange={(value) => {
                const product = products.find((p) => p.id === value)
                setSelectedProduct(product || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un produit" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {product.category?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => addEntry("in")}
            disabled={!selectedProduct}
            title="Ajouter entrée"
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => addEntry("out")}
            disabled={!selectedProduct}
            title="Ajouter sortie"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {entries.length > 0 && (
          <div className="space-y-3">
            <Label>Mouvements à Traiter ({entries.length})</Label>
            {entries.map((entry, index) => {
              const product = products.find((p) => p.id === entry.productId)
              return (
                <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                  <Badge variant={entry.type === "in" ? "default" : "secondary"}>
                    {entry.type === "in" ? "Entrée" : "Sortie"}
                  </Badge>
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{product?.name}</div>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    value={entry.quantity}
                    onChange={(e) => updateEntry(index, "quantity", Number.parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeEntry(index)}>
                    ×
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {entries.length > 0 && (
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? "Traitement..." : `Traiter ${entries.length} Mouvement(s)`}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
