"use client"

import type React from "react"

import { useState } from "react"
import type { Product } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Minus } from "lucide-react"

interface StockMovementFormProps {
  products: Product[]
  onMovementAdded?: () => void
}

export function StockMovementForm({ products, onMovementAdded }: StockMovementFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    productId: "",
    type: "in" as "in" | "out",
    quantity: "",
    unitPrice: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.productId || !formData.quantity || !formData.unitPrice) return

    setLoading(true)
    try {
      const product = products.find((p) => p.id === formData.productId)
      if (!product) return

      const quantity = Number.parseInt(formData.quantity)
      const unitPrice = Number.parseFloat(formData.unitPrice)

      // Get current stock
      const stockEntries = await dataService.getStockEntries()
      const currentEntry = stockEntries
        .filter((entry) => entry.productId === formData.productId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      const currentStock = currentEntry?.currentStock || 0
      const newStock = formData.type === "in" ? currentStock + quantity : Math.max(0, currentStock - quantity)

      // Create stock entry
      await dataService.createStockEntry({
        productId: formData.productId,
        date: new Date(),
        quantityIn: formData.type === "in" ? quantity : 0,
        quantityOut: formData.type === "out" ? quantity : 0,
        currentStock: newStock,
        unitPrice,
        totalValue: newStock * unitPrice,
        notes: formData.notes,
      })

      // Reset form
      setFormData({
        productId: "",
        type: "in",
        quantity: "",
        unitPrice: "",
        notes: "",
      })

      setIsOpen(false)
      onMovementAdded?.()
    } catch (error) {
      console.error("Erreur lors de l'ajout du mouvement:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = products.find((p) => p.id === formData.productId)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nouveau Mouvement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un Mouvement de Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Produit</Label>
            <Select
              value={formData.productId}
              onValueChange={(value) => {
                const product = products.find((p) => p.id === value)
                setFormData((prev) => ({
                  ...prev,
                  productId: value,
                  unitPrice: product?.unitPrice.toString() || "",
                }))
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type de Mouvement</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "in" | "out") => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">
                    <div className="flex items-center gap-2">
                      <Plus className="h-3 w-3 text-green-600" />
                      Entrée
                    </div>
                  </SelectItem>
                  <SelectItem value="out">
                    <div className="flex items-center gap-2">
                      <Minus className="h-3 w-3 text-red-600" />
                      Sortie
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitPrice">Prix Unitaire (€)</Label>
            <Input
              id="unitPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={(e) => setFormData((prev) => ({ ...prev, unitPrice: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          {selectedProduct && formData.quantity && formData.unitPrice && (
            <Card className="bg-muted/50">
              <CardContent className="p-3">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Valeur totale:</span>
                    <span className="font-medium">
                      {(Number.parseInt(formData.quantity) * Number.parseFloat(formData.unitPrice)).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              placeholder="Commentaires sur ce mouvement..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.productId || !formData.quantity || !formData.unitPrice}
              className="flex-1"
            >
              {loading ? "Ajout..." : "Ajouter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
