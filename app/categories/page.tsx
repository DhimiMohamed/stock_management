// app\categories\page.tsx
import { CategoryList } from "@/components/categories/category-list"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function CategoriesPage() {
  return (
    <ProtectedRoute>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Catégories</h1>
          <p className="text-muted-foreground">Gérez vos catégories de produits avec des couleurs personnalisées</p>
        </div>
        <CategoryList />
      </div>
    </ProtectedRoute>
  )
}
