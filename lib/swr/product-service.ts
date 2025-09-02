// lib/swr/product-service.ts
import useSWR, { mutate } from "swr"
import type { Product } from "../types"
import createClient from "../supabase/client"

const supabase = createClient()

// ---------- Fetcher ----------
async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(*)
    `
    )
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description || "",
    categoryId: item.category_id,
    unitPrice: item.unit_price,
    minStock: item.min_stock,
    actualStock: item.actual_stock || 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    category: item.categories
      ? {
          id: item.categories.id,
          name: item.categories.name,
          description: item.categories.description || "",
          createdAt: item.categories.created_at,
          updatedAt: item.categories.updated_at,
        }
      : undefined,
  }))
}

// ---------- Hook ----------
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    "products",
    fetchProducts
  )

  return {
    products: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

// ---------- Mutations ----------
export async function addProduct(
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
) {
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name: product.name,
        description: product.description,
        category_id: product.categoryId,
        unit_price: product.unitPrice,
        // min_stock: product.minStock,
        // actual_stock: product.actualStock || 0,
      },
    ])
    .select("*, categories(*)")
    .single()

  if (error) throw error
  mutate("products") // revalidate cache
  return data
}

export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, "id" | "createdAt">>
) {
  const dbUpdates: any = { updated_at: new Date().toISOString() }

  if (updates.name) dbUpdates.name = updates.name
  if (updates.description) dbUpdates.description = updates.description
  if (updates.categoryId) dbUpdates.category_id = updates.categoryId
  if (updates.unitPrice) dbUpdates.unit_price = updates.unitPrice
//   if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock
//   if (updates.actualStock !== undefined) dbUpdates.actual_stock = updates.actualStock

  const { data, error } = await supabase
    .from("products")
    .update(dbUpdates)
    .eq("id", id)
    .select("*, categories(*)")
    .single()

  if (error) throw error
  mutate("products")
  return data
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
  mutate("products")
  return true
}
