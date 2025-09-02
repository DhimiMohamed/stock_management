// lib/swr/stock-service.ts
import useSWR, { mutate } from "swr"
import type { StockEntry } from "../types"
import createClient from "../supabase/client"

const supabase = createClient()

// ---------- Fetchers ----------


// NEW: Fetcher for stock entries by product 
async function fetchStockEntriesByProduct(productId: string): Promise<StockEntry[]> {
  const { data, error } = await supabase
    .from("stock_entries")
    .select('*') // Only select stock entry fields, no product data
    .eq("product_id", productId)
    .order("date", { ascending: false })

  if (error) throw error
  
  return (data || []).map((entry) => ({
    id: entry.id,
    productId: entry.product_id,
    date: entry.date,
    quantityIn: entry.quantity_in,
    quantityOut: entry.quantity_out,
    currentStock: entry.current_stock,
    notes: entry.notes,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
  }))
}

// ---------- Hooks ----------

// NEW: Hook for stock entries by specific product
export function useStockEntriesByProduct(productId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<StockEntry[]>(
    productId ? `stock_entries_product_${productId}` : null,
    () => productId ? fetchStockEntriesByProduct(productId) : Promise.resolve([])
  )

  return {
    stockEntries: data,
    isLoading,
    isError: !!error,
    mutate,
  }
}

// ---------- Mutations ----------
export async function addStockEntry(entry: Omit<StockEntry, "id" | "createdAt" | "updatedAt">) {
  // Ensure consistent date string format to avoid timezone issues
  let dateString: string
  
  if (entry.date instanceof Date) {
    // Use local date components to avoid timezone shifts
    const year = entry.date.getFullYear()
    const month = String(entry.date.getMonth() + 1).padStart(2, "0")
    const day = String(entry.date.getDate()).padStart(2, "0")
    dateString = `${year}-${month}-${day}`
  } else if (typeof entry.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(entry.date)) {
    dateString = entry.date
  } else {
    // Fallback - convert to Date first then extract local components
    const d = new Date(entry.date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    dateString = `${year}-${month}-${day}`
  }

  const { data, error } = await supabase
    .from("stock_entries")
    .insert([{
      product_id: entry.productId,
      date: dateString,
      quantity_in: entry.quantityIn,
      quantity_out: entry.quantityOut,
      current_stock: entry.currentStock,
      notes: entry.notes,
    }])
    .select(`*, product:products(*)`)
    .single()

  if (error) throw error
  mutate("stock_entries")
  return data
}

export async function updateStockEntry(
  id: string,
  updates: Partial<Omit<StockEntry, "id" | "createdAt">>
) {
  const dbUpdates: any = { updated_at: new Date().toISOString() }

  if (updates.productId) dbUpdates.product_id = updates.productId
  if (updates.date) {
    // Use the same consistent date handling as addStockEntry
    let dateString: string
    
    if (updates.date instanceof Date) {
      // Use local date components to avoid timezone shifts
      const year = updates.date.getFullYear()
      const month = String(updates.date.getMonth() + 1).padStart(2, "0")
      const day = String(updates.date.getDate()).padStart(2, "0")
      dateString = `${year}-${month}-${day}`
    } else if (typeof updates.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(updates.date)) {
      dateString = updates.date
    } else {
      // Fallback - convert to Date first then extract local components
      const d = new Date(updates.date)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      dateString = `${year}-${month}-${day}`
    }
    
    dbUpdates.date = dateString
  }
  if (updates.quantityIn !== undefined) dbUpdates.quantity_in = updates.quantityIn
  if (updates.quantityOut !== undefined) dbUpdates.quantity_out = updates.quantityOut
  if (updates.currentStock !== undefined) dbUpdates.current_stock = updates.currentStock
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes

  const { data, error } = await supabase
    .from("stock_entries")
    .update(dbUpdates)
    .eq("id", id)
    .select(`*, product:products(*)`)
    .single()

  if (error) throw error
  mutate("stock_entries")
  return data
}

export async function deleteStockEntry(id: string) {
  const { error } = await supabase.from("stock_entries").delete().eq("id", id)
  if (error) throw error
  mutate("stock_entries")
  return true
}