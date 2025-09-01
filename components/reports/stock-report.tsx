"use client"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface StockReportData {
  product: Product
  currentStock: number
  stockValue: number
  status: "ok" | "low" | "out"
  lastMovement: Date | null
}

export function StockReport() {
  const [reportData, setReportData] = useState<StockReportData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateReport = async () => {
      try {
        const [products, stockEntries] = await Promise.all([dataService.getProducts(), dataService.getStockEntries()])

        const report = products.map((product) => {
          const productEntries = stockEntries.filter((entry) => entry.productId === product.id)
          const latestEntry = productEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

          const currentStock = latestEntry?.currentStock || 0
          const stockValue = currentStock * product.unitPrice

          let status: "ok" | "low" | "out" = "ok"
          if (currentStock === 0) status = "out"
          else if (currentStock <= product.minStock) status = "low"

          return {
            product,
            currentStock,
            stockValue,
            status,
            lastMovement: latestEntry?.date || null,
          }
        })

        setReportData(report.sort((a, b) => a.product.name.localeCompare(b.product.name)))
      } catch (error) {
        console.error("Erreur lors de la génération du rapport:", error)
      } finally {
        setLoading(false)
      }
    }

    generateReport()
  }, [])

  const exportToCSV = () => {
    const headers = [
      "Produit",
      "Catégorie",
      "Stock Actuel",
      "Stock Min",
      "Prix Unitaire",
      "Valeur Stock",
      "Statut",
      "Dernier Mouvement",
    ]
    const csvData = [
      headers.join(","),
      ...reportData.map((item) =>
        [
          `"${item.product.name}"`,
          `"${item.product.category?.name || ""}"`,
          item.currentStock,
          item.product.minStock,
          item.product.unitPrice.toFixed(2),
          item.stockValue.toFixed(2),
          item.status === "ok" ? "En stock" : item.status === "low" ? "Stock faible" : "Rupture",
          item.lastMovement ? format(item.lastMovement, "dd/MM/yyyy", { locale: fr }) : "Aucun",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `rapport_stock_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalValue = reportData.reduce((sum, item) => sum + item.stockValue, 0)
  const lowStockCount = reportData.filter((item) => item.status === "low").length
  const outOfStockCount = reportData.filter((item) => item.status === "out").length

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Génération du rapport...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rapport de Stock
          </CardTitle>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{reportData.length}</div>
              <div className="text-sm text-muted-foreground">Produits Total</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{totalValue.toFixed(2)} €</div>
              <div className="text-sm text-muted-foreground">Valeur Totale</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
              <div className="text-sm text-muted-foreground">Stock Faible</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{outOfStockCount}</div>
              <div className="text-sm text-muted-foreground">Rupture</div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Min</TableHead>
                <TableHead>Prix Unit.</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernier Mvt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((item) => (
                <TableRow key={item.product.id}>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell>{item.product.category?.name}</TableCell>
                  <TableCell className="text-center">{item.currentStock}</TableCell>
                  <TableCell className="text-center">{item.product.minStock}</TableCell>
                  <TableCell>{item.product.unitPrice.toFixed(2)} €</TableCell>
                  <TableCell>{item.stockValue.toFixed(2)} €</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === "ok" ? "default" : item.status === "low" ? "secondary" : "destructive"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {item.status !== "ok" && <AlertTriangle className="h-3 w-3" />}
                      {item.status === "ok" ? "En stock" : item.status === "low" ? "Stock faible" : "Rupture"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {item.lastMovement ? format(item.lastMovement, "dd/MM/yy", { locale: fr }) : "Aucun"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
