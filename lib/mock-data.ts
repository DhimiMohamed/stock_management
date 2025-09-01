// Données de test pour l'application
import type { Category, Product, StockEntry, StockMovement } from "./types"

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Électronique",
    description: "Appareils électroniques et accessoires",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Vêtements",
    description: "Articles vestimentaires",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Alimentation",
    description: "Produits alimentaires",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Smartphone Samsung",
    description: "Smartphone dernière génération",
    categoryId: "1",
    unitPrice: 599.99,
    minStock: 5,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "T-shirt Coton",
    description: "T-shirt 100% coton",
    categoryId: "2",
    unitPrice: 19.99,
    minStock: 20,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Café Bio",
    description: "Café biologique en grains",
    categoryId: "3",
    unitPrice: 12.5,
    minStock: 10,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockStockEntries: StockEntry[] = [
  {
    id: "1",
    productId: "1",
    date: new Date("2024-01-15"),
    quantityIn: 10,
    quantityOut: 0,
    currentStock: 10,
    unitPrice: 599.99,
    totalValue: 5999.9,
    notes: "Réception initiale",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    productId: "1",
    date: new Date("2024-01-20"),
    quantityIn: 0,
    quantityOut: 2,
    currentStock: 8,
    unitPrice: 599.99,
    totalValue: 4799.92,
    notes: "Vente client",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "3",
    productId: "2",
    date: new Date("2024-01-10"),
    quantityIn: 50,
    quantityOut: 0,
    currentStock: 50,
    unitPrice: 19.99,
    totalValue: 999.5,
    notes: "Stock initial",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
]

export const mockStockMovements: StockMovement[] = [
  {
    id: "1",
    productId: "1",
    type: "in",
    quantity: 10,
    unitPrice: 599.99,
    totalValue: 5999.9,
    date: new Date("2024-01-15"),
    notes: "Réception fournisseur",
  },
  {
    id: "2",
    productId: "1",
    type: "out",
    quantity: 2,
    unitPrice: 599.99,
    totalValue: 1199.98,
    date: new Date("2024-01-20"),
    notes: "Vente magasin",
  },
  {
    id: "3",
    productId: "2",
    type: "in",
    quantity: 50,
    unitPrice: 19.99,
    totalValue: 999.5,
    date: new Date("2024-01-10"),
    notes: "Commande initiale",
  },
]
