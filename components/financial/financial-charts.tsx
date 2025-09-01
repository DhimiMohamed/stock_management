"use client"

import { useState, useEffect } from "react"
import type { FinancialSummary } from "@/lib/types"
import { dataService } from "@/lib/data-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function FinancialCharts() {
  const [summaries, setSummaries] = useState<FinancialSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const endDate = new Date()
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        const data = await dataService.getFinancialSummary(startDate, endDate)
        setSummaries(data)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Chargement...</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const chartData = summaries.map((summary) => ({
    date: format(summary.date, "dd/MM", { locale: fr }),
    stockValue: summary.totalStockValue,
    investment: summary.totalInvestment,
    movement: summary.dailyMovement,
    profitLoss: summary.profitLoss,
  }))

  const pieData = [
    { name: "Valeur Stock", value: summaries[summaries.length - 1]?.totalStockValue || 0 },
    { name: "Investissement", value: summaries.reduce((sum, s) => sum + s.totalInvestment, 0) },
    { name: "Profit/Perte", value: Math.abs(summaries.reduce((sum, s) => sum + s.profitLoss, 0)) },
  ].filter((item) => item.value > 0)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Évolution de la Valeur du Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)} €`, ""]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="stockValue"
                stroke="#0088FE"
                strokeWidth={2}
                dot={{ fill: "#0088FE", strokeWidth: 2, r: 4 }}
                name="Valeur Stock"
              />
              <Line
                type="monotone"
                dataKey="investment"
                stroke="#00C49F"
                strokeWidth={2}
                dot={{ fill: "#00C49F", strokeWidth: 2, r: 4 }}
                name="Investissement"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mouvements Quotidiens</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)} €`, ""]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="movement" fill="#FFBB28" name="Mouvement" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profit/Perte par Jour</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(2)} €`, ""]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar
                dataKey="profitLoss"
                fill={(entry) => (entry >= 0 ? "#00C49F" : "#FF8042")}
                name="Profit/Perte"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Répartition Financière</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)} €`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
