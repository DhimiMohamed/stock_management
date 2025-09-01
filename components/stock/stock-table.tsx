"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Product, StockEntry, Category } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Package, Plus, Filter, Check, X, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StockWeeklyView } from "./stock-weekly-view"

interface StockTableProps {
  onAddStock?: (productId: string) => void
}

export function StockTable({ onAddStock }: StockTableProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showNewProductRow, setShowNewProductRow] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  })
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState({
    name: "",
    categoryId: "",
    unitPrice: "",
    minStock: "",
    currentStock: "", // Added current stock field
  })
  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryId: "",
    unitPrice: "",
    minStock: "",
    initialStock: "",
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, stockData, categoriesData] = await Promise.all([
          dataService.getProducts(),
          dataService.getStockEntries(),
          dataService.getCategories(),
        ])
        setProducts(productsData)
        setStockEntries(stockData)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getCurrentStock = (productId: string): number => {
    const latestEntry = stockEntries
      .filter((entry) => entry.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    return latestEntry?.currentStock || 0
  }

  const getStockStatus = (product: Product, currentStock: number) => {
    if (currentStock === 0) {
      return { status: "Rupture", variant: "destructive" as const }
    } else if (currentStock <= product.minStock) {
      return { status: "Stock faible", variant: "secondary" as const }
    } else {
      return { status: "En stock", variant: "default" as const }
    }
  }

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true
    return product.categoryId === selectedCategory
  })

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product)
  }

  const handleBackFromWeekly = () => {
    setSelectedProduct(null)
  }

  const handleAddNewProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.categoryId || !newProduct.unitPrice || !newProduct.minStock) {
        alert("Veuillez remplir tous les champs obligatoires")
        return
      }

      const productData = {
        name: newProduct.name,
        categoryId: newProduct.categoryId,
        unitPrice: Number.parseFloat(newProduct.unitPrice),
        minStock: Number.parseInt(newProduct.minStock),
      }

      const initialStock = newProduct.initialStock ? Number.parseInt(newProduct.initialStock) : 0
      await dataService.createProductWithStock(productData, initialStock)

      const [productsData, stockData] = await Promise.all([dataService.getProducts(), dataService.getStockEntries()])
      setProducts(productsData)
      setStockEntries(stockData)

      setNewProduct({
        name: "",
        categoryId: "",
        unitPrice: "",
        minStock: "",
        initialStock: "",
      })
      setShowNewProductRow(false)
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error)
      alert("Erreur lors de la création du produit")
    }
  }

  const handleCancelNewProduct = () => {
    setNewProduct({
      name: "",
      categoryId: "",
      unitPrice: "",
      minStock: "",
      initialStock: "",
    })
    setShowNewProductRow(false)
  }

  const handleEditProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    const currentStock = getCurrentStock(product.id)
    setEditingProduct(product.id)
    setEditProduct({
      name: product.name,
      categoryId: product.categoryId,
      unitPrice: product.unitPrice.toString(),
      minStock: product.minStock.toString(),
      currentStock: currentStock.toString(), // Set current stock value
    })
  }

  const handleSaveEdit = async (productId: string) => {
    try {
      const updatedProduct = {
        name: editProduct.name,
        categoryId: editProduct.categoryId,
        unitPrice: Number.parseFloat(editProduct.unitPrice),
        minStock: Number.parseInt(editProduct.minStock),
      }

      // Update product details
      await dataService.updateProduct(productId, updatedProduct)
      
      // Update current stock if it has changed
      const newCurrentStock = Number.parseInt(editProduct.currentStock)
      const originalCurrentStock = getCurrentStock(productId)
      
      if (newCurrentStock !== originalCurrentStock) {
        // Create a new stock entry with the updated current stock
        const stockEntry = {
          productId: productId,
          currentStock: newCurrentStock,
          date: new Date().toISOString(),
        }
        await dataService.createStockEntry(stockEntry)
      }

      // Reload data
      const [productsData, stockData] = await Promise.all([
        dataService.getProducts(),
        dataService.getStockEntries()
      ])
      setProducts(productsData)
      setStockEntries(stockData)
      setEditingProduct(null)
    } catch (error) {
      console.error("Erreur lors de la modification du produit:", error)
      alert("Erreur lors de la modification du produit")
    }
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
    setEditProduct({
      name: "",
      categoryId: "",
      unitPrice: "",
      minStock: "",
      currentStock: "",
    })
  }

  const handleDeleteProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteDialog({ open: true, product })
  }

  const handleConfirmDelete = async () => {
    if (!deleteDialog.product) return

    try {
      await dataService.deleteProduct(deleteDialog.product.id)
      const productsData = await dataService.getProducts()
      setProducts(productsData)
      setDeleteDialog({ open: false, product: null })
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error)
      alert("Erreur lors de la suppression du produit")
    }
  }

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

  if (selectedProduct) {
    return <StockWeeklyView product={selectedProduct} onBack={handleBackFromWeekly} />
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Gestion du Stock
            </CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Stock Actuel</TableHead>
                <TableHead>Stock Min.</TableHead>
                <TableHead>Prix Unitaire</TableHead>
                <TableHead>Valeur Stock</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => {
                const currentStock = getCurrentStock(product.id)
                const stockValue = currentStock * product.unitPrice
                const { status, variant } = getStockStatus(product, currentStock)
                const isEditing = editingProduct === product.id

                return (
                  <TableRow
                    key={product.id}
                    className={`cursor-pointer hover:bg-muted/50 ${isEditing ? "bg-muted/20" : ""}`}
                    onClick={() => !isEditing && handleProductClick(product)}
                  >
                    <TableCell className="font-medium">
                      {isEditing ? (
                        <Input
                          value={editProduct.name}
                          onChange={(e) => setEditProduct((prev) => ({ ...prev, name: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        product.name
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Select
                          value={editProduct.categoryId}
                          onValueChange={(value) => setEditProduct((prev) => ({ ...prev, categoryId: value }))}
                        >
                          <SelectTrigger onClick={(e) => e.stopPropagation()}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        product.category?.name
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editProduct.currentStock}
                          onChange={(e) => setEditProduct((prev) => ({ ...prev, currentStock: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        currentStock
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editProduct.minStock}
                          onChange={(e) => setEditProduct((prev) => ({ ...prev, minStock: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        product.minStock
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editProduct.unitPrice}
                          onChange={(e) => setEditProduct((prev) => ({ ...prev, unitPrice: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        `${product.unitPrice.toFixed(2)} €`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing 
                        ? `${((Number.parseInt(editProduct.currentStock) || 0) * Number.parseFloat(editProduct.unitPrice || "0")).toFixed(2)} €`
                        : `${stockValue.toFixed(2)} €`
                      }
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant} className="flex items-center gap-1">
                        {currentStock <= product.minStock && <AlertTriangle className="h-3 w-3" />}
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveEdit(product.id)
                            }}
                            className="flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCancelEdit()
                            }}
                            className="flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleEditProduct(product, e)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => handleDeleteProduct(product, e)}
                            className="flex items-center gap-1 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {showNewProductRow && (
                <TableRow className="bg-muted/20">
                  <TableCell>
                    <Input
                      placeholder="Nom du produit"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      value={newProduct.categoryId}
                      onValueChange={(value) => setNewProduct((prev) => ({ ...prev, categoryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Stock initial"
                      value={newProduct.initialStock}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, initialStock: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      placeholder="Stock min"
                      value={newProduct.minStock}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, minStock: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Prix"
                      value={newProduct.unitPrice}
                      onChange={(e) => setNewProduct((prev) => ({ ...prev, unitPrice: e.target.value }))}
                    />
                  </TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={handleAddNewProduct} className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelNewProduct}
                        className="flex items-center gap-1 bg-transparent"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          {!showNewProductRow && (
            <div className="mt-4 flex justify-center">
              <Button onClick={() => setShowNewProductRow(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Ajouter un nouveau produit
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit "{deleteDialog.product?.name}" ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, product: null })}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
