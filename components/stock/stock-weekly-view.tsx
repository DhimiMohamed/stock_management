// components/stock/stock-weekly-view.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Product, StockEntry } from "@/lib/types"
import { 
  useStockEntriesByProduct,
  addStockEntry, 
  updateStockEntry
} from "@/lib/swr/stock-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ArrowLeft, Save, Plus, Edit, Check, X } from "lucide-react"

interface StockWeeklyViewProps {
  product: Product
  onBack: () => void
}

interface DayMovement {
  date: Date
  dateString: string // Add this to store the normalized date string
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
  const [editingRow, setEditingRow] = useState<EditingRow | null>(null)
  const [saving, setSaving] = useState(false)

  const { stockEntries, isLoading, isError, mutate: mutateStockEntries } = useStockEntriesByProduct(product.id)

  const normalizeDate = (date: Date | string): string => {
    const d = typeof date === "string" ? new Date(date) : new Date(date)
    // Ensure we're working with local time, not UTC
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const createDateFromString = (dateString: string): Date => {
    // Create date in local timezone to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day, 0, 0, 0, 0)
  }

  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
    startOfWeek.setDate(diff)
    startOfWeek.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek)
      dayDate.setDate(startOfWeek.getDate() + i)
      dayDate.setHours(0, 0, 0, 0)
      week.push(dayDate)
    }
    return week
  }

  const buildWeeklyData = () => {
    if (!stockEntries) return

    const weekDates = getWeekDates(currentWeek)
    const sortedEntries = [...stockEntries].sort(
      (a, b) => new Date(normalizeDate(a.date)).getTime() - new Date(normalizeDate(b.date)).getTime()
    )

    // Get the starting stock for the week
    const weekStart = weekDates[0]
    const weekStartString = normalizeDate(weekStart)
    const entriesBeforeWeek = sortedEntries.filter(entry => normalizeDate(entry.date) < weekStartString)
    let startingStock = entriesBeforeWeek.length > 0 ? entriesBeforeWeek[entriesBeforeWeek.length - 1].currentStock || 0 : 0

    // Build weekly movements with proper stock calculation
    let runningStock = startingStock
    const weeklyMovements: DayMovement[] = weekDates.map(date => {
      const dateString = normalizeDate(date)
      const dayEntry = sortedEntries.find(entry => normalizeDate(entry.date) === dateString)
      
      const quantityIn = dayEntry?.quantityIn || 0
      const quantityOut = dayEntry?.quantityOut || 0
      const netBalance = quantityIn - quantityOut

      // Calculate current stock based on previous day + net balance
      runningStock = Math.max(0, runningStock + netBalance)
      const currentStock = runningStock

      return {
        date,
        dateString, // Store the normalized date string
        quantityIn,
        quantityOut,
        netBalance,
        currentStock,
        stockEntry: dayEntry,
        notes: dayEntry?.notes || ""
      }
    })

    setWeeklyData(weeklyMovements)
  }

  useEffect(() => {
    buildWeeklyData()
  }, [currentWeek, stockEntries])

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === "next" ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date())
  }

  const formatDate = (date: Date) => date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" })
  
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
    if (editingRow) setEditingRow({ ...editingRow, [field]: value })
  }

  const calculateNewStock = (dayIndex: number, newQuantityIn: number, newQuantityOut: number) => {
    // Get previous day's stock or starting stock for the week
    let previousStock = 0
    
    if (dayIndex === 0) {
      // First day of week - get stock from last entry before this week
      const weekStart = getWeekDates(currentWeek)[0]
      const weekStartString = normalizeDate(weekStart)
      const entriesBeforeWeek = (stockEntries || [])
        .filter(entry => normalizeDate(entry.date) < weekStartString)
        .sort((a, b) => new Date(normalizeDate(a.date)).getTime() - new Date(normalizeDate(b.date)).getTime())
      
      previousStock = entriesBeforeWeek.length > 0 ? entriesBeforeWeek[entriesBeforeWeek.length - 1].currentStock || 0 : 0
    } else {
      // Use previous day in the week
      previousStock = weeklyData[dayIndex - 1]?.currentStock || 0
    }
    
    const netBalance = newQuantityIn - newQuantityOut
    return Math.max(0, previousStock + netBalance)
  }

  const handleSaveEdit = async () => {
    if (!editingRow || saving) return
    setSaving(true)
    try {
      const dayData = weeklyData[editingRow.dayIndex]
      const updatedQuantityIn = Math.max(0, parseInt(editingRow.quantityIn) || 0)
      const updatedQuantityOut = Math.max(0, parseInt(editingRow.quantityOut) || 0)
      const updatedNotes = editingRow.notes || ""
      const newCurrentStock = calculateNewStock(editingRow.dayIndex, updatedQuantityIn, updatedQuantityOut)

      // Use the stored dateString to create the date consistently
      const entryDate = createDateFromString(dayData.dateString)

      if (dayData.stockEntry) {
        await updateStockEntry(dayData.stockEntry.id, {
          quantityIn: updatedQuantityIn,
          quantityOut: updatedQuantityOut,
          currentStock: newCurrentStock,
          notes: updatedNotes,
          date: entryDate
        })
      } else {
        await addStockEntry({
          productId: product.id,
          date: entryDate,
          quantityIn: updatedQuantityIn,
          quantityOut: updatedQuantityOut,
          currentStock: newCurrentStock,
          notes: updatedNotes
        })
      }

      // Force refresh of stock entries and rebuild weekly data
      await mutateStockEntries()
      setEditingRow(null)
    } catch (error) {
      console.error("Error saving stock entry:", error)
      alert("Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const addQuickEntry = async (dayIndex: number, type: 'in' | 'out', amount: number) => {
    if (saving) return
    setSaving(true)
    try {
      const dayData = weeklyData[dayIndex]
      const newQuantityIn = dayData.quantityIn + (type === 'in' ? amount : 0)
      const newQuantityOut = dayData.quantityOut + (type === 'out' ? amount : 0)
      const newCurrentStock = calculateNewStock(dayIndex, newQuantityIn, newQuantityOut)

      // FIX: Use the stored dateString to create the date consistently
      const entryDate = createDateFromString(dayData.dateString)

      if (dayData.stockEntry) {
        await updateStockEntry(dayData.stockEntry.id, {
          quantityIn: newQuantityIn,
          quantityOut: newQuantityOut,
          currentStock: newCurrentStock,
          notes: dayData.notes,
          date: entryDate
        })
      } else {
        await addStockEntry({
          productId: product.id,
          date: entryDate,
          quantityIn: newQuantityIn,
          quantityOut: newQuantityOut,
          currentStock: newCurrentStock,
          notes: ""
        })
      }

      // Force refresh of stock entries
      await mutateStockEntries()
    } catch (error) {
      console.error("Error adding quick entry:", error)
      alert("Erreur lors de l'ajout")
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => setEditingRow(null)
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { 
      e.preventDefault()
      handleSaveEdit()
    }
    if (e.key === "Escape") { 
      e.preventDefault()
      handleCancelEdit()
    }
  }

  if (isLoading) {
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

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            Erreur lors du chargement des données
          </div>
        </CardContent>
      </Card>
    )
  }

  const weekTotal = weeklyData.reduce((sum, day) => sum + (day.netBalance || 0), 0)

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
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">{getWeekRange()}</span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={goToCurrentWeek}>
                Cette semaine
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
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
              <div className="text-sm text-muted-foreground">Stock Net</div>
              <div className={`font-semibold ${weekTotal > 0 ? 'text-green-600' : weekTotal < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {weekTotal > 0 ? `+${weekTotal}` : weekTotal}
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jour</TableHead>
                <TableHead className="text-center">Entrées</TableHead>
                <TableHead className="text-center">Sorties</TableHead>
                <TableHead className="text-center">Stock Net</TableHead>
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
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editingRow.quantityIn}
                          onChange={e => handleInputChange("quantityIn", e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-20 text-center"
                          min="0"
                        />
                      ) : (
                        <div className={`${day.quantityIn > 0 ? "text-green-600" : "text-gray-500"} min-h-[32px] flex items-center justify-center`}>
                          {day.quantityIn > 0 ? `+${day.quantityIn}` : "—"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editingRow.quantityOut}
                          onChange={e => handleInputChange("quantityOut", e.target.value)}
                          onKeyDown={handleKeyPress}
                          className="w-20 text-center"
                          min="0"
                        />
                      ) : (
                        <div className={`${day.quantityOut > 0 ? "text-red-600" : "text-gray-500"} min-h-[32px] flex items-center justify-center`}>
                          {day.quantityOut > 0 ? `-${day.quantityOut}` : "—"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={`text-center font-medium ${day.netBalance > 0 ? "text-green-600" : day.netBalance < 0 ? "text-red-600" : "text-gray-500"}`}>
                      {day.netBalance !== 0 ? (day.netBalance > 0 ? `+${day.netBalance}` : day.netBalance) : "—"}
                    </TableCell>
                    <TableCell className="max-w-48">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editingRow.notes}
                          onChange={e => handleInputChange("notes", e.target.value)}
                          onKeyDown={handleKeyPress}
                          placeholder="Ajouter une note..."
                        />
                      ) : (
                        <div className="text-sm min-h-[32px] flex items-center">{day.notes || "—"}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {isEditing ? (
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" onClick={handleSaveEdit} disabled={saving} className="text-green-600 hover:text-green-700">
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={saving} className="text-gray-600 hover:text-gray-700">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="outline" onClick={() => handleEditRow(index)} disabled={saving} className="text-blue-600 hover:text-blue-700">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); addQuickEntry(index, 'in', 1) }} disabled={saving} className="text-green-600 hover:text-green-700">
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); addQuickEntry(index, 'out', 1) }} disabled={saving} className="text-red-600 hover:text-red-700">
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