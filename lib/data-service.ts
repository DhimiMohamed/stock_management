// lib\data-service.ts

import type { Category, Product, StockEntry } from "./types"
import createClient from "./supabase/client"

const supabase = createClient()

// Categories (already migrated and working)
export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function addCategory(category: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...category }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCategory(id: string, updates: Partial<Omit<Category, "id" | "createdAt">>): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
  return true
}

// Products (updated to work with Supabase)
export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories!inner(*)
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  // Map the data to match your frontend Product type
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description || '',
    categoryId: item.category_id,
    unitPrice: item.unit_price,
    minStock: item.min_stock,
    actualStock: item.actual_stock || 0,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    category: item.categories ? {
      id: item.categories.id,
      name: item.categories.name,
      description: item.categories.description || '',
      createdAt: item.categories.created_at,
      updatedAt: item.categories.updated_at
    } : undefined
  }))
}

export async function addProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([{ 
      name: product.name,
      description: product.description,
      category_id: product.categoryId,
      unit_price: product.unitPrice,
      min_stock: product.minStock,
      actual_stock: product.actualStock || 0
    }])
    .select(`
      *,
      category:categories(*)
    `)
    .single()
  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, "id" | "createdAt">>): Promise<Product | null> {
  // Map the updates to match database column names
  const dbUpdates: any = {
    updated_at: new Date().toISOString()
  }
  
  if (updates.name) dbUpdates.name = updates.name
  if (updates.description) dbUpdates.description = updates.description
  if (updates.categoryId) dbUpdates.category_id = updates.categoryId
  if (updates.unitPrice) dbUpdates.unit_price = updates.unitPrice
  if (updates.minStock !== undefined) dbUpdates.min_stock = updates.minStock
  if (updates.actualStock !== undefined) dbUpdates.actual_stock = updates.actualStock

  const { data, error } = await supabase
    .from('products')
    .update(dbUpdates)
    .eq('id', id)
    .select(`
      *,
      category:categories(*)
    `)
    .single()
  if (error) throw error
  return data
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
  return true
}

// Stock Entries (updated to work with Supabase)
export async function getStockEntries(): Promise<StockEntry[]> {
  const { data, error } = await supabase
    .from('stock_entries')
    .select(`
      *,
      product:products(*)
    `)
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getStockEntriesByProduct(productId: string): Promise<StockEntry[]> {
  const { data, error } = await supabase
    .from('stock_entries')
    .select(`
      *,
      product:products(*)
    `)
    .eq('product_id', productId)
    .order('date', { ascending: false })
  
  if (error) throw error
  
  // Transform snake_case to camelCase
  return (data || []).map(entry => ({
    id: entry.id,
    productId: entry.product_id,
    date: entry.date,
    quantityIn: entry.quantity_in,
    quantityOut: entry.quantity_out,
    currentStock: entry.current_stock,
    notes: entry.notes,
    createdAt: entry.created_at,
    updatedAt: entry.updated_at
  }))
}

export async function addStockEntry(entry: Omit<StockEntry, "id" | "createdAt" | "updatedAt">): Promise<StockEntry> {
  const { data, error } = await supabase
    .from('stock_entries')
    .insert([{ 
      product_id: entry.productId,
      date: entry.date,
      quantity_in: entry.quantityIn,
      quantity_out: entry.quantityOut,
      current_stock: entry.currentStock,
      notes: entry.notes
    }])
    .select(`
      *,
      product:products(*)
    `)
    .single()
  if (error) throw error
  return data
}

export async function updateStockEntry(id: string, updates: Partial<Omit<StockEntry, "id" | "createdAt">>): Promise<StockEntry | null> {
  // Map the updates to match database column names
  const dbUpdates: any = {
    updated_at: new Date().toISOString()
  }
  
  if (updates.productId) dbUpdates.product_id = updates.productId
  if (updates.date) dbUpdates.date = updates.date
  if (updates.quantityIn !== undefined) dbUpdates.quantity_in = updates.quantityIn
  if (updates.quantityOut !== undefined) dbUpdates.quantity_out = updates.quantityOut
  if (updates.currentStock !== undefined) dbUpdates.current_stock = updates.currentStock
  if (updates.notes) dbUpdates.notes = updates.notes

  const { data, error } = await supabase
    .from('stock_entries')
    .update(dbUpdates)
    .eq('id', id)
    .select(`
      *,
      product:products(*)
    `)
    .single()
  if (error) throw error
  return data
}

export async function deleteStockEntry(id: string): Promise<boolean> {
  const { error } = await supabase.from('stock_entries').delete().eq('id', id)
  if (error) throw error
  return true
}

// Create product and initial stock entry together (updated for Supabase)
export async function createProductWithStock(
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  initialStock = 0
): Promise<{ product: Product; stockEntry: StockEntry }> {
  // 1. Create product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert([{
      name: productData.name,
      description: productData.description,
      category_id: productData.categoryId,
      unit_price: productData.unitPrice,
      min_stock: productData.minStock,
      actual_stock: initialStock
    }])
    .select(`
      *,
      category:categories(*)
    `)
    .single();
  if (productError) throw productError;

  // 2. Create initial stock entry
  const { data: stockEntry, error: stockError } = await supabase
    .from('stock_entries')
    .insert([{
      product_id: product.id,
      date: new Date().toISOString().slice(0, 10),
      quantity_in: initialStock,
      quantity_out: 0,
      current_stock: initialStock
    }])
    .select(`
      *,
      product:products(*)
    `)
    .single();
  if (stockError) throw stockError;

  return { product, stockEntry };
}

// Dashboard Stats (updated to work with Supabase)
export async function getDashboardStats() {
  try {
    // Get total categories from Supabase
    const { count: totalCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })

    if (categoriesError) {
      console.error('Error counting categories:', categoriesError)
      throw categoriesError
    }

    // Get total products from Supabase
    const { count: totalProducts, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (productsError) {
      console.error('Error counting products:', productsError)
      throw productsError
    }

    // Get products with their current stock for calculations
    const { data: products, error: productDataError } = await supabase
      .from('products')
      .select('id, unit_price, min_stock, actual_stock')

    if (productDataError) {
      console.error('Error fetching product data:', productDataError)
      throw productDataError
    }

    // Calculate total stock value
    const totalStockValue = products?.reduce((sum, product) => {
      return sum + (product.actual_stock * product.unit_price)
    }, 0) || 0

    // Count low stock alerts
    const lowStockAlerts = products?.filter(product => 
      product.actual_stock <= product.min_stock
    ).length || 0

    // Calculate daily movement (last 24h) from stock entries
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)

    const { data: recentEntries, error: entriesError } = await supabase
      .from('stock_entries')
      .select(`
        quantity_in, 
        quantity_out,
        products!inner(unit_price)
      `)
      .gte('date', yesterdayStr)

    if (entriesError) {
      console.error('Error fetching recent stock entries:', entriesError)
      throw entriesError
    }

    const dailyMovement = recentEntries?.reduce((sum, entry) => {
      const productPrice = entry.products?.[0]?.unit_price || 0
      const netQuantity = entry.quantity_in - entry.quantity_out
      return sum + (netQuantity * productPrice)
    }, 0) || 0

    return {
      totalProducts: totalProducts || 0,
      totalCategories: totalCategories || 0,
      totalStockValue,
      lowStockAlerts,
      dailyMovement,
      monthlyTrend: 5.2, // You can calculate this based on historical data later
    }
  } catch (error) {
    console.error('Failed to get dashboard stats:', error)
    throw error
  }
}

// Financial Summary (updated to work with Supabase)
export async function getFinancialSummary(startDate: Date, endDate: Date) {
  try {
    const startDateStr = startDate.toISOString().slice(0, 10)
    const endDateStr = endDate.toISOString().slice(0, 10)

    // Get stock entries for the date range with product prices
    const { data: entries, error } = await supabase
      .from('stock_entries')
      .select(`
        date,
        quantity_in,
        quantity_out,
        current_stock,
        products!inner(unit_price)
      `)
      .gte('date', startDateStr)
      .lte('date', endDateStr)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching financial data:', error)
      throw error
    }

    // Group entries by date and calculate daily summaries
    const dailySummaries = new Map()
    
    entries?.forEach(entry => {
      const date = entry.date
      if (!dailySummaries.has(date)) {
        dailySummaries.set(date, {
          date: new Date(date),
          totalStockValue: 0,
          totalInvestment: 0,
          dailyMovement: 0,
          profitLoss: 0
        })
      }
      
      const summary = dailySummaries.get(date)
      const unitPrice = entry.products?.[0]?.unit_price || 0
      const netMovement = entry.quantity_in - entry.quantity_out
      
      summary.dailyMovement += netMovement * unitPrice
      summary.totalStockValue += entry.current_stock * unitPrice
      summary.totalInvestment += entry.quantity_in * unitPrice
      summary.profitLoss += netMovement * unitPrice * 0.2 // Assuming 20% margin
    })

    return Array.from(dailySummaries.values())
  } catch (error) {
    console.error('Failed to get financial summary:', error)
    throw error
  }
}