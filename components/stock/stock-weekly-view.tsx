// components/stock/stock-weekly-view.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Product, StockEntry } from "@/lib/types"
import { 
  getStockEntriesByProduct, 
  addStockEntry, 
  updateStockEntry,
  updateProduct 
} from "@/lib/data-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ArrowLeft, Save, Plus, Edit, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StockWeeklyViewProps {
  product: Product
  onBack: () => void
}

interface DayMovement {
  date: Date
  quantityIn: number
  quantityOut: number
  netBalance: number
  currentStock: number
  stockEntry?: StockEntry
  notes: string
}

interface EditingRow {
  dayIndex: number
  quantityIn: string
  quantityOut: string
  notes: string
}

export function StockWeeklyView({ product, onBack }: StockWeeklyViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [weeklyData, setWeeklyData] = useState<DayMovement[]>([])
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null)
  const [saving, setSaving] = useState(false)

  // Fixed date normalization function
  const normalizeDate = (date: Date | string): string => {
    let d: Date
    
    if (typeof date === 'string') {
      // If it's already in YYYY-MM-DD format, return as-is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date
      }
      d = new Date(date)
    } else {
      d = new Date(date)
    }
    
    // Use local date to avoid timezone shifts
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }

  // Fixed week dates function
  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Monday as first day
    
    // Set to the start of the week, keeping local timezone
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0) // Normalize to start of day in LOCAL timezone

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + i)
      dayDate.setHours(0, 0, 0, 0) // Keep in local timezone
      week.push(dayDate)
    }
    return week
  }

  const loadWeeklyData = async () => {
    setLoading(true)
    try {
      console.log("Loading data for product:", product.id)
      const entries = await getStockEntriesByProduct(product.id)
      console.log("Found stock entries:", entries)
      
      setStockEntries(entries)
      
      const weekDates = getWeekDates(currentWeek)
      console.log("Week dates:", weekDates.map(d => normalizeDate(d)))
      
      // Sort entries by date to ensure proper chronological order
      const sortedEntries = [...entries].sort((a, b) => {
        const dateA = new Date(normalizeDate(a.date))
        const dateB = new Date(normalizeDate(b.date))
        return dateA.getTime() - dateB.getTime()
      })

      // Find the most recent entry before this week to determine starting stock
      const weekStart = weekDates[0]
      const weekStartString = normalizeDate(weekStart)
      
      const entriesBeforeWeek = sortedEntries.filter(entry => {
        const entryDateString = normalizeDate(entry.date)
        return entryDateString < weekStartString
      })

      // Starting stock: either from the last entry before this week, or product's actual stock
      let startingStock = product.actualStock || 0
      if (entriesBeforeWeek.length > 0) {
        const lastEntryBeforeWeek = entriesBeforeWeek[entriesBeforeWeek.length - 1]
        startingStock = lastEntryBeforeWeek.currentStock || 0
      }

      console.log("Starting stock for week:", startingStock)
      console.log("Product actual stock:", product.actualStock)

      // Build weekly movements
      let runningStock = startingStock
      const weeklyMovements: DayMovement[] = weekDates.map((date, index) => {
        const dateString = normalizeDate(date)
        
        // Find entry for this specific day
        const dayEntry = sortedEntries.find(entry => {
          const entryDateString = normalizeDate(entry.date)
          return entryDateString === dateString
        })
        
        console.log(`Day ${dateString}:`, dayEntry ? "Has entry" : "No entry")
        
        const quantityIn = dayEntry?.quantityIn || 0
        const quantityOut = dayEntry?.quantityOut || 0
        const netBalance = quantityIn - quantityOut
        
        // Calculate current stock for this day
        let currentStock: number
        if (dayEntry) {
          // Use the recorded stock from the entry
          currentStock = dayEntry.currentStock || 0
          runningStock = currentStock // Update running stock for next day
        } else {
          // Calculate based on previous day + net balance
          currentStock = runningStock
          // Don't update runningStock since there's no actual movement
        }
        
        console.log(`Day ${dateString}: in=${quantityIn}, out=${quantityOut}, stock=${currentStock}`)
        
        const dayMovement: DayMovement = {
          date,
          quantityIn,
          quantityOut,
          netBalance,
          currentStock,
          stockEntry: dayEntry,
          notes: dayEntry?.notes || ""
        }

        // Update running stock only if there was an actual entry
        if (dayEntry) {
          runningStock = currentStock
        }

        return dayMovement
      })

      console.log("Weekly movements:", weeklyMovements)
      setWeeklyData(weeklyMovements)
    } catch (error) {
      console.error("Error loading weekly data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeeklyData()
  }, [currentWeek, product.id])

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    })
  }

  const getWeekRange = () => {
    const weekDates = getWeekDates(currentWeek)
    const start = weekDates[0].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    const end = weekDates[6].toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
    return `${start} - ${end}`
  }

  const handleEditRow = (dayIndex: number) => {
    const dayData = weeklyData[dayIndex]
    setEditingRow({
      dayIndex,
      quantityIn: dayData.quantityIn.toString(),
      quantityOut: dayData.quantityOut.toString(),
      notes: dayData.notes || ""
    })
  }

  const handleInputChange = (field: "quantityIn" | "quantityOut" | "notes", value: string) => {
    if (editingRow) {
      setEditingRow({
        ...editingRow,
        [field]: value
      })
    }
  }

  const calculateNewStock = (dayIndex: number, newQuantityIn: number, newQuantityOut: number) => {
    // Get stock from previous day or starting stock
    let previousStock: number
    
    if (dayIndex === 0) {
      // First day of week - use starting stock
      const weekStart = getWeekDates(currentWeek)[0]
      const weekStartString = normalizeDate(weekStart)
      const entriesBeforeWeek = stockEntries.filter(entry => {
        const entryDateString = normalizeDate(entry.date)
        return entryDateString < weekStartString
      }).sort((a, b) => new Date(normalizeDate(a.date)).getTime() - new Date(normalizeDate(b.date)).getTime())
      
      previousStock = entriesBeforeWeek.length > 0 
        ? (entriesBeforeWeek[entriesBeforeWeek.length - 1].currentStock || 0)
        : (product.actualStock || 0)
    } else {
      // Use previous day's stock
      previousStock = weeklyData[dayIndex - 1]?.currentStock || 0
    }
    
    const netBalance = (newQuantityIn || 0) - (newQuantityOut || 0)
    return Math.max(0, previousStock + netBalance)
  }

  // Fixed handleSaveEdit function
  const handleSaveEdit = async () => {
    if (!editingRow || saving) return

    setSaving(true)
    try {
      const dayData = weeklyData[editingRow.dayIndex]
      // Create a proper date string for the database
      const dateString = normalizeDate(dayData.date)

      const updatedQuantityIn = Math.max(0, parseInt(editingRow.quantityIn) || 0)
      const updatedQuantityOut = Math.max(0, parseInt(editingRow.quantityOut) || 0)
      const updatedNotes = editingRow.notes || ""

      const newCurrentStock = calculateNewStock(editingRow.dayIndex, updatedQuantityIn, updatedQuantityOut)

      console.log("Saving entry:", {
        date: dateString, // Use string instead of Date object
        quantityIn: updatedQuantityIn,
        quantityOut: updatedQuantityOut,
        currentStock: newCurrentStock,
        notes: updatedNotes
      })

      if (dayData.stockEntry) {
        // Update existing stock entry
        await updateStockEntry(dayData.stockEntry.id, {
          quantityIn: updatedQuantityIn,
          quantityOut: updatedQuantityOut,
          currentStock: newCurrentStock,
          notes: updatedNotes,
          date: dateString // Pass as string
        })
      } else {
        // Create new stock entry
        await addStockEntry({
          productId: product.id,
          date: dateString, // Pass as string
          quantityIn: updatedQuantityIn,
          quantityOut: updatedQuantityOut,
          currentStock: newCurrentStock,
          notes: updatedNotes
        })
      }

      // Update product's actual stock to reflect the latest changes
      const allDatesInWeek = getWeekDates(currentWeek).map(d => normalizeDate(d))
      const currentDateIndex = allDatesInWeek.indexOf(dateString)
      
      // If this is the last entry of the week, or the most recent entry, update product stock
      const hasLaterEntries = weeklyData.slice(currentDateIndex + 1).some(day => day.stockEntry)
      if (!hasLaterEntries) {
        await updateProduct(product.id, { actualStock: newCurrentStock })
      }

      // Reload data to reflect changes
      await loadWeeklyData()
      setEditingRow(null)
    } catch (error) {
      console.error("Error saving stock entry:", error)
      alert("Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingRow(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSaveEdit()
    } else if (e.key === "Escape") {
      e.preventDefault()
      handleCancelEdit()
    }
  }

  // Fixed addQuickEntry function
  const addQuickEntry = async (dayIndex: number, type: 'in' | 'out', amount: number) => {
    if (saving) return
    
    setSaving(true)
    try {
      const dayData = weeklyData[dayIndex]
      // Create a proper date string for the database
      const dateString = normalizeDate(dayData.date)

      const newQuantityIn = dayData.quantityIn + (type === 'in' ? amount : 0)
      const newQuantityOut = dayData.quantityOut + (type === 'out' ? amount : 0)
      const newCurrentStock = calculateNewStock(dayIndex, newQuantityIn, newQuantityOut)

      console.log("Quick entry:", { type, amount, newQuantityIn, newQuantityOut, newCurrentStock })

      if (dayData.stockEntry) {
        await updateStockEntry(dayData.stockEntry.id, {
          quantityIn: newQuantityIn,
          quantityOut: newQuantityOut,
          currentStock: newCurrentStock,
          notes: dayData.notes,
          date: dateString // Pass as string
        })
      } else {
        await addStockEntry({
          productId: product.id,
          date: dateString, // Pass as string
          quantityIn: newQuantityIn,
          quantityOut: newQuantityOut,
          currentStock: newCurrentStock,
          notes: ""
        })
      }

      // Update product's actual stock if this is the most recent entry
      const allDatesInWeek = getWeekDates(currentWeek).map(d => normalizeDate(d))
      const currentDateIndex = allDatesInWeek.indexOf(dateString)
      const hasLaterEntries = weeklyData.slice(currentDateIndex + 1).some(day => day.stockEntry)
      if (!hasLaterEntries) {
        await updateProduct(product.id, { actualStock: newCurrentStock })
      }

      await loadWeeklyData()
    } catch (error) {
      console.error("Error adding quick entry:", error)
      alert("Erreur lors de l'ajout")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const weekTotal = weeklyData.reduce((sum, day) => sum + (day.netBalance || 0), 0)
  const currentStock = product.actualStock || 0
  const stockStatus = currentStock <= (product.minStock || 0) ? "Attention" : "Normal"

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Mouvements Hebdomadaires - {product.name}</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Stock actuel: <span className="font-medium">{currentStock}</span>
              <Badge variant={stockStatus === "Attention" ? "destructive" : "default"} className="ml-2">
                {stockStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{getWeekRange()}</span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Debug Info - Remove in production */}
          <div className="p-2 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong> Found {stockEntries.length} stock entries for product {product.id}
            {stockEntries.length > 0 && (
              <div>Latest entry: {normalizeDate(stockEntries[stockEntries.length - 1]?.date)} - Stock: {stockEntries[stockEntries.length - 1]?.currentStock}</div>
            )}
          </div>

          {/* Week Summary */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Entrées</div>
              <div className="font-semibold text-green-600">
                +{weeklyData.reduce((sum, day) => sum + (day.quantityIn || 0), 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Total Sorties</div>
              <div className="font-semibold text-red-600">
                -{weeklyData.reduce((sum, day) => sum + (day.quantityOut || 0), 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Solde Net</div>
              <div className={`font-semibold ${weekTotal > 0 ? 'text-green-600' : weekTotal < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {weekTotal > 0 ? `+${weekTotal}` : weekTotal}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Valeur Stock</div>
              <div className="font-semibold">
                {(currentStock * (product.unitPrice || 0)).toFixed(2)} €
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jour</TableHead>
                <TableHead className="text-center">Entrées</TableHead>
                <TableHead className="text-center">Sorties</TableHead>
                <TableHead className="text-center">Solde Net</TableHead>
                <TableHead className="text-center">Stock Final</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weeklyData.map((day, index) => {
                const isEditing = editingRow?.dayIndex === index
                
                return (
                  <TableRow key={index} className={day.stockEntry ? "bg-blue-50/50" : ""}>
                    <TableCell className="font-medium">{formatDate(day.date)}</TableCell>
                    
                    {/* Quantity In */}
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editingRow.quantityIn}
                          onChange={(e) => handleInputChange("quantityIn", e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-20 text-center"
                          min="0"
                          placeholder="0"
                        />
                      ) : (
                        <div className={`${day.quantityIn > 0 ? "text-green-600" : "text-gray-500"} min-h-[32px] flex items-center justify-center`}>
                          {day.quantityIn > 0 ? `+${day.quantityIn}` : "—"}
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Quantity Out */}
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editingRow.quantityOut}
                          onChange={(e) => handleInputChange("quantityOut", e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-20 text-center"
                          min="0"
                          placeholder="0"
                        />
                      ) : (
                        <div className={`${day.quantityOut > 0 ? "text-red-600" : "text-gray-500"} min-h-[32px] flex items-center justify-center`}>
                          {day.quantityOut > 0 ? `-${day.quantityOut}` : "—"}
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Net Balance */}
                    <TableCell
                      className={`text-center font-medium ${
                        day.netBalance > 0 ? "text-green-600" : day.netBalance < 0 ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      {day.netBalance !== 0 ? (day.netBalance > 0 ? `+${day.netBalance}` : day.netBalance) : "—"}
                    </TableCell>
                    
                    {/* Current Stock */}
                    <TableCell className="text-center font-medium">
                      {day.currentStock}
                    </TableCell>
                    
                    {/* Notes */}
                    <TableCell className="max-w-48">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editingRow.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Ajouter une note..."
                        />
                      ) : (
                        <div className="text-sm min-h-[32px] flex items-center">
                          {day.notes || "—"}
                        </div>
                      )}
                    </TableCell>
                    
                    {/* Actions */}
                    <TableCell className="text-center">
                      {isEditing ? (
                        <div className="flex gap-1 justify-center">
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={saving}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRow(index)}
                            disabled={saving}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              addQuickEntry(index, 'in', 1)
                            }}
                            disabled={saving}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              addQuickEntry(index, 'out', 1)
                            }}
                            disabled={saving}
                            className="text-red-600 hover:text-red-700"
                          >
                            -1
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {saving && (
            <div className="flex items-center justify-center p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Save className="h-4 w-4 animate-spin" />
                Sauvegarde en cours...
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}