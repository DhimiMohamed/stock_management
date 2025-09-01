// lib\data-service.ts
import type { Category, Product, StockEntry, StockMovement, DashboardStats, FinancialSummary } from "./types"
import { mockProducts, mockStockEntries, mockStockMovements } from "./mock-data"
import createClient from "./supabase/client"

class DataService {
  private supabase = createClient()
  
  // Keep mock data for non-category features (until you migrate them)
  private products: Product[] = [...mockProducts]
  private stockEntries: StockEntry[] = [...mockStockEntries]
  private stockMovements: StockMovement[] = [...mockStockMovements]

  // Categories - Now using Supabase
  async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        throw error
      }

      return data.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        color: row.color,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      }))
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      throw error
    }
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return undefined // Not found
        console.error('Error fetching category:', error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Failed to fetch category:', error)
      throw error
    }
  }

  async createCategory(category: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .insert([
          {
            name: category.name,
            description: category.description,
            color: category.color
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Failed to create category:', error)
      throw error
    }
  }

  async addCategory(category: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<Category> {
    return this.createCategory(category)
  }

  async updateCategory(id: string, updates: Partial<Omit<Category, "id" | "createdAt">>): Promise<Category | null> {
    try {
      const { data, error } = await this.supabase
        .from('categories')
        .update({
          name: updates.name,
          description: updates.description,
          color: updates.color,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating category:', error)
        throw error
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        color: data.color,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    } catch (error) {
      console.error('Failed to update category:', error)
      throw error
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      // Check if category is used by any products (when you migrate products to Supabase)
      // For now, checking local mock data
      const productsUsingCategory = this.products.filter((product) => product.categoryId === id)
      if (productsUsingCategory.length > 0) {
        throw new Error("Cannot delete category that is being used by products")
      }

      const { error } = await this.supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting category:', error)
        throw error
      }

      return true
    } catch (error) {
      console.error('Failed to delete category:', error)
      throw error
    }
  }

  // Products - Still using mock data (migrate these later)
  async getProducts(): Promise<Product[]> {
    return this.products.map((product) => ({
      ...product,
      // This will need to be updated when you migrate categories
      category: undefined, // You might want to fetch from Supabase here
    }))
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const product = this.products.find((p) => p.id === id)
    if (product) {
      return {
        ...product,
        category: undefined, // You might want to fetch from Supabase here
      }
    }
    return undefined
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.products.push(newProduct)
    return newProduct
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, "id" | "createdAt">>): Promise<Product | null> {
    const productIndex = this.products.findIndex((product) => product.id === id)
    if (productIndex === -1) return null

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return this.products[productIndex]
  }

  async deleteProduct(id: string): Promise<boolean> {
    const productIndex = this.products.findIndex((product) => product.id === id)
    if (productIndex === -1) return false

    // Remove associated stock entries and movements
    this.stockEntries = this.stockEntries.filter((entry) => entry.productId !== id)
    this.stockMovements = this.stockMovements.filter((movement) => movement.productId !== id)

    this.products.splice(productIndex, 1)
    return true
  }

  // Stock Entries - Still using mock data
  async getStockEntries(): Promise<StockEntry[]> {
    return this.stockEntries.map((entry) => ({
      ...entry,
      product: this.products.find((p) => p.id === entry.productId),
    }))
  }

  async createStockEntry(entry: Omit<StockEntry, "id" | "createdAt" | "updatedAt">): Promise<StockEntry> {
    const newEntry: StockEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.stockEntries.push(newEntry)
    return newEntry
  }

  // Stock Movements - Still using mock data
  async getStockMovements(): Promise<StockMovement[]> {
    return this.stockMovements.map((movement) => ({
      ...movement,
      product: this.products.find((p) => p.id === movement.productId),
    }))
  }

  async updateStockMovement(
    productId: string,
    date: Date,
    field: "quantityIn" | "quantityOut",
    newValue: number,
  ): Promise<void> {
    // Find existing movement for this product and date
    const existingMovementIndex = this.stockMovements.findIndex(
      (movement) => movement.productId === productId && movement.date.toDateString() === date.toDateString(),
    )

    const product = this.products.find((p) => p.id === productId)
    if (!product) return

    if (existingMovementIndex >= 0) {
      // Update existing movement
      const movement = this.stockMovements[existingMovementIndex]
      if (field === "quantityIn" && movement.type === "in") {
        movement.quantity = newValue
        movement.totalValue = newValue * product.unitPrice
      } else if (field === "quantityOut" && movement.type === "out") {
        movement.quantity = newValue
        movement.totalValue = newValue * product.unitPrice
      }
    } else if (newValue > 0) {
      // Create new movement if value is greater than 0
      const newMovement: StockMovement = {
        id: Date.now().toString(),
        productId,
        type: field === "quantityIn" ? "in" : "out",
        quantity: newValue,
        unitPrice: product.unitPrice,
        totalValue: newValue * product.unitPrice,
        date: new Date(date),
        reason: field === "quantityIn" ? "Ajustement entrée" : "Ajustement sortie",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      this.stockMovements.push(newMovement)
    }

    // Update stock entry if exists
    const stockEntryIndex = this.stockEntries.findIndex((entry) => entry.productId === productId)
    if (stockEntryIndex >= 0) {
      // Recalculate current stock based on all movements
      const allMovements = this.stockMovements.filter((m) => m.productId === productId)
      const totalIn = allMovements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.quantity, 0)
      const totalOut = allMovements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.quantity, 0)

      this.stockEntries[stockEntryIndex].currentStock = totalIn - totalOut
      this.stockEntries[stockEntryIndex].updatedAt = new Date()
    }
  }

  // Dashboard Stats - Using mix of Supabase and mock data
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get total categories from Supabase
      const { count: totalCategories, error } = await this.supabase
        .from('categories')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error counting categories:', error)
        throw error
      }

      const totalProducts = this.products.length

      // Calculate current stock values (still using mock data)
      const productStocks = new Map<string, number>()
      this.stockEntries.forEach((entry) => {
        productStocks.set(entry.productId, entry.currentStock)
      })

      let totalStockValue = 0
      this.products.forEach((product) => {
        const stock = productStocks.get(product.id) || 0
        totalStockValue += stock * product.unitPrice
      })

      // Count low stock alerts
      const lowStockAlerts = this.products.filter((product) => {
        const currentStock = productStocks.get(product.id) || 0
        return currentStock <= product.minStock
      }).length

      // Calculate daily movement (last 24h)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const recentMovements = this.stockMovements.filter((movement) => movement.date >= yesterday)
      const dailyMovement = recentMovements.reduce((sum, movement) => sum + movement.totalValue, 0)

      return {
        totalProducts,
        totalCategories: totalCategories || 0,
        totalStockValue,
        lowStockAlerts,
        dailyMovement,
        monthlyTrend: 5.2, // Mock trend percentage
      }
    } catch (error) {
      console.error('Failed to get dashboard stats:', error)
      throw error
    }
  }

  // Financial Summary - Still using mock data
  async getFinancialSummary(startDate: Date, endDate: Date): Promise<FinancialSummary[]> {
    // Mock financial data for the date range
    const summaries: FinancialSummary[] = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dayMovements = this.stockMovements.filter(
        (movement) => movement.date.toDateString() === currentDate.toDateString(),
      )

      const dailyMovement = dayMovements.reduce(
        (sum, movement) => sum + (movement.type === "in" ? movement.totalValue : -movement.totalValue),
        0,
      )

      summaries.push({
        date: new Date(currentDate),
        totalStockValue: Math.random() * 50000 + 20000, // Mock values
        totalInvestment: Math.random() * 30000 + 15000,
        dailyMovement,
        profitLoss: dailyMovement * 0.2, // Mock 20% margin
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return summaries
  }

  async createProductWithStock(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
    initialStock = 0,
  ): Promise<{ product: Product; stockEntry: StockEntry }> {
    const product = await this.createProduct(productData)

    const stockEntry = await this.createStockEntry({
      productId: product.id,
      currentStock: initialStock,
      minStock: productData.minStock,
      maxStock: productData.maxStock || 1000,
      lastRestockDate: new Date(),
    })

    return { product, stockEntry }
  }

  async createStockEntry(entry: Omit<StockEntry, "id" | "createdAt" | "updatedAt">): Promise<StockEntry> {
    const newEntry: StockEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.stockEntries.push(newEntry)
    return newEntry
  }

  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.products.push(newProduct)
    return newProduct
  }
}

export const dataService = new DataService()

// Category exports - now using Supabase
export const addCategory = (category: Omit<Category, "id" | "createdAt" | "updatedAt">) =>
  dataService.addCategory(category)

export const updateCategory = (id: string, updates: Partial<Omit<Category, "id" | "createdAt">>) =>
  dataService.updateCategory(id, updates)

export const deleteCategory = (id: string) => dataService.deleteCategory(id)

export const getCategories = () => dataService.getCategories()

// Product exports - still using mock data
export const createProductWithStock = (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  initialStock?: number,
) => dataService.createProductWithStock(productData, initialStock)

export const updateProduct = (id: string, updates: Partial<Omit<Product, "id" | "createdAt">>) =>
  dataService.updateProduct(id, updates)

export const deleteProduct = (id: string) => dataService.deleteProduct(id)

export const getDashboardStats = () => dataService.getDashboardStats()

export const getFinancialSummary = (startDate: Date, endDate: Date) => 
  dataService.getFinancialSummary(startDate, endDate)