// components\categories\category-list.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tags, Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/lib/data-service"
import type { Category } from "@/lib/types"

const categoryColors = [
  { name: "Bleu", value: "bg-blue-100 text-blue-800 border-blue-200", hex: "#3B82F6" },
  { name: "Vert", value: "bg-green-100 text-green-800 border-green-200", hex: "#10B981" },
  { name: "Rouge", value: "bg-red-100 text-red-800 border-red-200", hex: "#EF4444" },
  { name: "Jaune", value: "bg-yellow-100 text-yellow-800 border-yellow-200", hex: "#F59E0B" },
  { name: "Violet", value: "bg-purple-100 text-purple-800 border-purple-200", hex: "#8B5CF6" },
  { name: "Rose", value: "bg-pink-100 text-pink-800 border-pink-200", hex: "#EC4899" },
  { name: "Indigo", value: "bg-indigo-100 text-indigo-800 border-indigo-200", hex: "#6366F1" },
  { name: "Orange", value: "bg-orange-100 text-orange-800 border-orange-200", hex: "#F97316" },
]

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: categoryColors[0].hex,
  })

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const categoriesData = await getCategories()
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Erreur lors du chargement des catégories')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleAddCategory = async () => {
    if (!formData.name.trim()) return
    
    try {
      setIsSubmitting(true)
      setError(null)
      await addCategory({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
      })
      await fetchCategories()
      setFormData({ name: "", description: "", color: categoryColors[0].hex })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error('Error adding category:', error)
      setError('Erreur lors de l\'ajout de la catégorie')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !formData.name.trim()) return
    
    try {
      setIsSubmitting(true)
      setError(null)
      await updateCategory(editingCategory.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
      })
      await fetchCategories()
      setEditingCategory(null)
      setIsEditDialogOpen(false)
    } catch (error) {
      console.error('Error updating category:', error)
      setError('Erreur lors de la modification de la catégorie')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      setError(null)
      await deleteCategory(categoryId)
      await fetchCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
      setError('Erreur lors de la suppression de la catégorie')
    }
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || "",
      color: category.color || categoryColors[0].hex,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", color: categoryColors[0].hex })
    setEditingCategory(null)
    setError(null)
  }

  const getColorClass = (colorHex: string) => {
    const colorObj = categoryColors.find(c => c.hex === colorHex)
    return colorObj?.value || categoryColors[0].value
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des catégories...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Gestion des Catégories
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Catégorie
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle catégorie</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Nom de la catégorie</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom de la catégorie"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Description (optionnel)"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label>Couleur</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {categoryColors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.hex })}
                        disabled={isSubmitting}
                        className={`p-2 rounded-lg border-2 ${
                          formData.color === color.hex ? "border-gray-800" : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-full h-6 rounded ${color.value} flex items-center justify-center text-xs font-medium`}
                        >
                          {color.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleAddCategory} 
                  className="w-full"
                  disabled={isSubmitting || !formData.name.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    'Ajouter'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune catégorie trouvée. Ajoutez votre première catégorie !
          </div>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getColorClass(category.color || categoryColors[0].hex)}>
                    {category.name}
                  </Badge>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    {category.description && <p className="text-sm text-muted-foreground">{category.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog
                    open={isEditDialogOpen && editingCategory?.id === category.id}
                    onOpenChange={setIsEditDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Modifier la catégorie</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {error && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </div>
                        )}
                        <div>
                          <Label htmlFor="edit-name">Nom de la catégorie</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Nom de la catégorie"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Description</Label>
                          <Input
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Description (optionnel)"
                            disabled={isSubmitting}
                          />
                        </div>
                        <div>
                          <Label>Couleur</Label>
                          <div className="grid grid-cols-4 gap-2 mt-2">
                            {categoryColors.map((color) => (
                              <button
                                key={color.name}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: color.hex })}
                                disabled={isSubmitting}
                                className={`p-2 rounded-lg border-2 ${
                                  formData.color === color.hex ? "border-gray-800" : "border-gray-200"
                                }`}
                              >
                                <div
                                  className={`w-full h-6 rounded ${color.value} flex items-center justify-center text-xs font-medium`}
                                >
                                  {color.name}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        <Button 
                          onClick={handleEditCategory} 
                          className="w-full"
                          disabled={isSubmitting || !formData.name.trim()}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Mise à jour...
                            </>
                          ) : (
                            'Mettre à jour'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer la catégorie</AlertDialogTitle>
                        <AlertDialogDescription>
                          Êtes-vous sûr de vouloir supprimer la catégorie "{category.name}" ? Cette action est
                          irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteCategory(category.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}