// lib\types.ts
export interface Category {
  id: string
  name: string
  description?: string
  color?: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  categoryId: string
  category?: Category
  unitPrice: number
  createdAt: Date
  updatedAt: Date
}

export interface StockEntry {
  id: string;
  productId: string;
  product?: Product;
  date: Date;
  quantityIn: number;
  quantityOut: number;
  currentStock: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialSummary {
  date: Date
  totalStockValue: number
  totalInvestment: number
  dailyMovement: number
  profitLoss: number
}

export interface DashboardStats {
  totalProducts: number
  totalCategories: number
  totalStockValue: number
  lowStockAlerts: number
  dailyMovement: number
  monthlyTrend: number
}

export interface StockMovement {
  id: string
  productId: string
  product?: Product
  type: "in" | "out"
  quantity: number
  unitPrice: number
  totalValue: number
  date: Date
  notes?: string
}
