"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Product } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"

interface StockWeeklyViewProps {
  product: Product
  onBack: () => void
}

interface DayMovement {
  date: Date
  quantityIn: number
  quantityOut: number
  netBalance: number
}

interface EditingCell {
  dayIndex: number
  field: "quantityIn" | "quantityOut"
  value: string
}

export function StockWeeklyView({ product, onBack }: StockWeeklyViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [weeklyData, setWeeklyData] = useState<DayMovement[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)

  const getWeekDates = (date: Date) => {
    const week = []
    const startOfWeek = new Date(date)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Lundi comme premier jour
    startOfWeek.setDate(diff)

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      week.push(day)
    }
    return week
  }

  const loadWeeklyData = async () => {
    setLoading(true)
    try {
      const movements = await dataService.getStockMovements()
      const weekDates = getWeekDates(currentWeek)

      const weeklyMovements: DayMovement[] = weekDates.map((date) => {
        const dayMovements = movements.filter(
          (movement) => movement.productId === product.id && movement.date.toDateString() === date.toDateString(),
        )

        const quantityIn = dayMovements.filter((m) => m.type === "in").reduce((sum, m) => sum + m.quantity, 0)

        const quantityOut = dayMovements.filter((m) => m.type === "out").reduce((sum, m) => sum + m.quantity, 0)

        return {
          date,
          quantityIn,
          quantityOut,
          netBalance: quantityIn - quantityOut,
        }
      })

      setWeeklyData(weeklyMovements)
    } catch (error) {
      console.error("Erreur lors du chargement des données hebdomadaires:", error)
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

  const handleCellClick = (dayIndex: number, field: "quantityIn" | "quantityOut") => {
    const currentValue = weeklyData[dayIndex][field]
    setEditingCell({
      dayIndex,
      field,
      value: currentValue.toString(),
    })
  }

  const handleInputChange = (value: string) => {
    if (editingCell) {
      setEditingCell({
        ...editingCell,
        value,
      })
    }
  }

  const handleSaveEdit = async () => {
    if (!editingCell) return

    const newValue = Number.parseInt(editingCell.value) || 0
    const updatedData = [...weeklyData]
    updatedData[editingCell.dayIndex][editingCell.field] = newValue

    // Recalculate net balance
    const dayData = updatedData[editingCell.dayIndex]
    dayData.netBalance = dayData.quantityIn - dayData.quantityOut

    setWeeklyData(updatedData)

    // Save to data service
    try {
      const date = weeklyData[editingCell.dayIndex].date
      await dataService.updateStockMovement(product.id, date, editingCell.field, newValue)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error)
    }

    setEditingCell(null)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit()
    } else if (e.key === "Escape") {
      setEditingCell(null)
    }
  }

  const handleBlur = () => {
    handleSaveEdit()
  }

  const renderEditableCell = (
    dayIndex: number,
    field: "quantityIn" | "quantityOut",
    value: number,
    colorClass: string,
  ) => {
    const isEditing = editingCell?.dayIndex === dayIndex && editingCell?.field === field

    if (isEditing) {
      return (
        <Input
          type="number"
          value={editingCell.value}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur}
          className="w-20 h-8 text-center"
          autoFocus
          min="0"
        />
      )
    }

    return (
      <div
        className={`cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition-colors ${colorClass}`}
        onClick={() => handleCellClick(dayIndex, field)}
      >
        {value > 0 ? (field === "quantityIn" ? `+${value}` : `-${value}`) : "-"}
      </div>
    )
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jour</TableHead>
              <TableHead className="text-center">Entrées</TableHead>
              <TableHead className="text-center">Sorties</TableHead>
              <TableHead className="text-center">Solde Net</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {weeklyData.map((day, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{formatDate(day.date)}</TableCell>
                <TableCell className="text-center">
                  {renderEditableCell(index, "quantityIn", day.quantityIn, "text-green-600")}
                </TableCell>
                <TableCell className="text-center">
                  {renderEditableCell(index, "quantityOut", day.quantityOut, "text-red-600")}
                </TableCell>
                <TableCell
                  className={`text-center font-medium ${
                    day.netBalance > 0 ? "text-green-600" : day.netBalance < 0 ? "text-red-600" : "text-gray-500"
                  }`}
                >
                  {day.netBalance !== 0 ? (day.netBalance > 0 ? `+${day.netBalance}` : day.netBalance) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
