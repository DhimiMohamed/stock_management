import { ProductForm } from "@/components/data-entry/product-form"
import { CategoryForm } from "@/components/data-entry/category-form"
import { BulkImport } from "@/components/data-entry/bulk-import"
import { QuickStockEntry } from "@/components/data-entry/quick-stock-entry"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function DataEntryPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Saisie de Données</h1>
          <p className="text-muted-foreground">Ajoutez des produits, catégories et gérez les mouvements de stock</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="categories">Catégories</TabsTrigger>
            <TabsTrigger value="stock">Stock Rapide</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <ProductForm />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <CategoryForm />
          </TabsContent>

          <TabsContent value="stock" className="space-y-6">
            <QuickStockEntry />
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <BulkImport />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
