"use client"

import type React from "react"
import { useState } from "react"
import type { Product, Category } from "@/lib/types"
import { StockWeeklyView } from "./stock-weekly-view"

import { 
  useProducts,
  addProduct,
  updateProduct,
  deleteProduct
} from "@/lib/swr/product-service"
import { useCategories } from "@/lib/swr/category-service"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Plus, Filter, Check, X, Edit, Trash2, BarChart } from "lucide-react"

interface ProductTableProps {
  onAddStock?: (productId: string) => void
}

export function ProductTable({ onAddStock }: ProductTableProps) {
  const { products, isLoading, isError, mutate } = useProducts()
  const { categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories()

  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null) // ✅ for stock view
  const [showNewProductRow, setShowNewProductRow] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [editProduct, setEditProduct] = useState({
    name: "",
    categoryId: "",
    unitPrice: "",
  })
  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryId: "",
    unitPrice: "",
  })

  const filteredProducts = products?.filter((product) => {
    if (selectedCategory === "all") return true
    return product.categoryId === selectedCategory
  }) || []

  const handleAddNewProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.categoryId || !newProduct.unitPrice) {
        alert("Veuillez remplir tous les champs obligatoires")
        return
      }

      const productData = {
        name: newProduct.name,
        categoryId: newProduct.categoryId,
        unitPrice: Number.parseFloat(newProduct.unitPrice) || 0,
        description: ""
      }

      await addProduct(productData)

      setNewProduct({
        name: "",
        categoryId: "",
        unitPrice: "",
      })
      setShowNewProductRow(false)
      mutate()
    } catch (error) {
      console.error("Erreur lors de la création du produit:", error)
      alert("Erreur lors de la création du produit")
    }
  }

  const handleEditProduct = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProduct(product.id)
    setEditProduct({
      name: product.name,
      categoryId: product.categoryId,
      unitPrice: (product.unitPrice || 0).toString(),
    })
  }

  const handleSaveEdit = async (productId: string) => {
    try {
      const updatedProductData = {
        name: editProduct.name,
        categoryId: editProduct.categoryId,
        unitPrice: Number.parseFloat(editProduct.unitPrice) || 0,
      }

      await updateProduct(productId, updatedProductData)
      setEditingProduct(null)
      mutate()
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
    })
  }

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`)) return
    try {
      await deleteProduct(product.id)
      mutate()
    } catch (error) {
      console.error("Erreur lors de la suppression du produit:", error)
      alert("Erreur lors de la suppression du produit")
    }
  }

  const handleBackFromWeekly = async () => {
    setSelectedProduct(null)
  }

  // ✅ Show stock weekly view if product is selected
  if (selectedProduct) {
    return (
      // <Card>
      //   <CardHeader>
      //     <div className="flex items-center justify-between">
      //       <CardTitle className="flex items-center gap-2">
      //         <BarChart className="h-5 w-5" />
      //         Stock hebdomadaire – {selectedProduct.name}
      //       </CardTitle>
      //       <Button variant="outline" onClick={() => setSelectedProduct(null)}>
      //         ← Retour aux produits
      //       </Button>
      //     </div>
      //   </CardHeader>
      //   <CardContent>
          <StockWeeklyView product={selectedProduct} onBack={handleBackFromWeekly}/>
      //   </CardContent>
      // </Card>
    )
  }

  // ✅ Otherwise show product list
  if (isLoading || categoriesLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">Chargement...</CardContent>
      </Card>
    )
  }

  if (isError || categoriesError) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-red-500">
          Erreur lors du chargement des données
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gestion des Produits
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les produits</SelectItem>
                {categories.map((category: Category) => (
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
              <TableHead>Prix Unitaire</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => {
              const isEditing = editingProduct === product.id

              return (
                <TableRow key={product.id} className={isEditing ? "bg-muted/20" : ""}>
                  <TableCell className="font-medium">
                    {isEditing ? (
                      <Input
                        value={editProduct.name}
                        onChange={(e) => setEditProduct((prev) => ({ ...prev, name: e.target.value }))}
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
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      product.category?.name || "Non définie"
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editProduct.unitPrice}
                        onChange={(e) => setEditProduct((prev) => ({ ...prev, unitPrice: e.target.value }))}
                      />
                    ) : (
                      `${(product.unitPrice || 0).toFixed(2)} €`
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(product.id)}
                          className="flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
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
                          onClick={() => setSelectedProduct(product)} // ✅ open stock view
                          className="flex items-center gap-1"
                        >
                          <BarChart className="h-3 w-3" />
                        </Button>
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
                          onClick={() => handleDeleteProduct(product)}
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
                      {categories.map((category: Category) => (
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
                    step="0.01"
                    placeholder="Prix"
                    value={newProduct.unitPrice}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, unitPrice: e.target.value }))}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleAddNewProduct} className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowNewProductRow(false)}
                      className="flex items-center gap-1"
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
  )
}
