"use client"

import { useState, useEffect } from "react"
import type { FinancialSummary } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { Download, CalendarIcon, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export function FinancialReport() {
  const [summaries, setSummaries] = useState<FinancialSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  useEffect(() => {
    const generateReport = async () => {
      setLoading(true)
      try {
        const data = await dataService.getFinancialSummary(dateRange.from, dateRange.to)
        setSummaries(data)
      } catch (error) {
        console.error("Erreur lors de la génération du rapport financier:", error)
      } finally {
        setLoading(false)
      }
    }

    generateReport()
  }, [dateRange])

  const exportToCSV = () => {
    const headers = ["Date", "Valeur Stock", "Investissement", "Mouvement Quotidien", "Profit/Perte"]
    const csvData = [
      headers.join(","),
      ...summaries.map((summary) =>
        [
          format(summary.date, "dd/MM/yyyy", { locale: fr }),
          summary.totalStockValue.toFixed(2),
          summary.totalInvestment.toFixed(2),
          summary.dailyMovement.toFixed(2),
          summary.profitLoss.toFixed(2),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `rapport_financier_${format(new Date(), "yyyy-MM-dd")}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const chartData = summaries.map((summary) => ({
    date: format(summary.date, "dd/MM", { locale: fr }),
    stockValue: summary.totalStockValue,
    investment: summary.totalInvestment,
    movement: summary.dailyMovement,
    profitLoss: summary.profitLoss,
  }))

  const totalInvestment = summaries.reduce((sum, s) => sum + s.totalInvestment, 0)
  const totalMovement = summaries.reduce((sum, s) => sum + s.dailyMovement, 0)
  const totalProfitLoss = summaries.reduce((sum, s) => sum + s.profitLoss, 0)
  const currentStockValue = summaries.length > 0 ? summaries[summaries.length - 1].totalStockValue : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-muted-foreground">Génération du rapport financier...</div>
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
            <TrendingUp className="h-5 w-5" />
            Rapport Financier
          </CardTitle>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <CalendarIcon className="h-4 w-4" />
                  {format(dateRange.from, "dd MMM", { locale: fr })} - {format(dateRange.to, "dd MMM", { locale: fr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({ from: range.from, to: range.to })
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{currentStockValue.toFixed(2)} €</div>
              <div className="text-sm text-muted-foreground">Valeur Stock Actuelle</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{totalInvestment.toFixed(2)} €</div>
              <div className="text-sm text-muted-foreground">Investissement Total</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl font-bold ${totalMovement >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalMovement >= 0 ? "+" : ""}
                {totalMovement.toFixed(2)} €
              </div>
              <div className="text-sm text-muted-foreground">Mouvement Total</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalProfitLoss >= 0 ? "+" : ""}
                {totalProfitLoss.toFixed(2)} €
              </div>
              <div className="text-sm text-muted-foreground">Profit/Perte</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Évolution Valeur Stock</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)} €`, ""]} />
                    <Line
                      type="monotone"
                      dataKey="stockValue"
                      stroke="#0088FE"
                      strokeWidth={2}
                      dot={{ fill: "#0088FE", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profit/Perte Quotidien</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(2)} €`, ""]} />
                    <Bar dataKey="profitLoss" fill="#00C49F" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
