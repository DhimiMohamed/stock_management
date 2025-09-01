"use client"

import { useState, useEffect } from "react"
import type { StockMovement } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function MovementReport() {
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [filteredMovements, setFilteredMovements] = useState<StockMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "in" | "out">("all")

  useEffect(() => {
    const loadMovements = async () => {
      try {
        const data = await dataService.getStockMovements()
        const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setMovements(sortedData)
        setFilteredMovements(sortedData)
      } catch (error) {
        console.error("Erreur lors du chargement des mouvements:", error)
      } finally {
        setLoading(false)
      }
    }

    loadMovements()
  }, [])

  useEffect(() => {
    let filtered = movements

    if (searchTerm) {
      filtered = filtered.filter(
        (movement) =>
          movement.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          movement.notes?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((movement) => movement.type === typeFilter)
    }

    setFilteredMovements(filtered)
  }, [movements, searchTerm, typeFilter])

  const exportToCSV = () => {
    const headers = ["Date", "Produit", "Type", "Quantité", "Prix Unitaire", "Valeur Totale", "Notes"]
    const csvData = [
      headers.join(","),
      ...filteredMovements.map((movement) =>
        [
          format(movement.date, "dd/MM/yyyy HH:mm", { locale: fr }),
          `"${movement.product?.name || ""}"`,
          movement.type === "in" ? "Entrée" : "Sortie",
          movement.quantity,
          movement.unitPrice.toFixed(2),
          movement.totalValue.toFixed(2),
          `"${movement.notes || ""}"`,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `rapport_mouvements_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const totalEntries = filteredMovements.filter((m) => m.type === "in").length
  const totalExits = filteredMovements.filter((m) => m.type === "out").length
  const totalValueIn = filteredMovements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.totalValue, 0)
  const totalValueOut = filteredMovements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.totalValue, 0)

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Chargement des mouvements...</div>
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
            <Search className="h-5 w-5" />
            Rapport des Mouvements
          </CardTitle>
          <Button onClick={exportToCSV} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalEntries}</div>
              <div className="text-sm text-muted-foreground">Entrées</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalExits}</div>
              <div className="text-sm text-muted-foreground">Sorties</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalValueIn.toFixed(2)} €</div>
              <div className="text-sm text-muted-foreground">Valeur Entrées</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">{totalValueOut.toFixed(2)} €</div>
              <div className="text-sm text-muted-foreground">Valeur Sorties</div>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par produit ou notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value: "all" | "in" | "out") => setTypeFilter(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="in">Entrées uniquement</SelectItem>
                <SelectItem value="out">Sorties uniquement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Quantité</TableHead>
                <TableHead>Prix Unit.</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovements.map((movement) => (
                <TableRow key={movement.id}>
                  <TableCell className="text-sm">{format(movement.date, "dd/MM/yy HH:mm", { locale: fr })}</TableCell>
                  <TableCell className="font-medium">{movement.product?.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={movement.type === "in" ? "default" : "secondary"}
                      className="flex items-center gap-1 w-fit"
                    >
                      {movement.type === "in" ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {movement.type === "in" ? "Entrée" : "Sortie"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{movement.quantity}</TableCell>
                  <TableCell>{movement.unitPrice.toFixed(2)} €</TableCell>
                  <TableCell className={movement.type === "in" ? "text-green-600" : "text-red-600"}>
                    {movement.type === "in" ? "+" : "-"}
                    {movement.totalValue.toFixed(2)} €
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{movement.notes}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredMovements.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun mouvement trouvé avec les filtres actuels
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
