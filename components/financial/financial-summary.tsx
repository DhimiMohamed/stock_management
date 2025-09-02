// "use client"

// import { useState, useEffect } from "react"
// import type { FinancialSummary } from "@/lib/types"
// import { dataService } from "@/lib/data-service"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"
// import { format } from "date-fns"
// import { fr } from "date-fns/locale"

// export function FinancialSummaryComponent() {
//   const [summaries, setSummaries] = useState<FinancialSummary[]>([])
//   const [loading, setLoading] = useState(true)
//   const [dateRange, setDateRange] = useState({
//     from: new Date(new Date().setDate(new Date().getDate() - 30)),
//     to: new Date(),
//   })

//   const loadFinancialData = async () => {
//     setLoading(true)
//     try {
//       const data = await dataService.getFinancialSummary(dateRange.from, dateRange.to)
//       setSummaries(data)
//     } catch (error) {
//       console.error("Erreur lors du chargement des données financières:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     loadFinancialData()
//   }, [dateRange])

//   const totalInvestment = summaries.reduce((sum, s) => sum + s.totalInvestment, 0)
//   const totalStockValue = summaries.length > 0 ? summaries[summaries.length - 1].totalStockValue : 0
//   const totalMovement = summaries.reduce((sum, s) => sum + s.dailyMovement, 0)
//   const totalProfitLoss = summaries.reduce((sum, s) => sum + s.profitLoss, 0)

//   const profitMargin = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-balance">Suivi Financier</h2>
//           <p className="text-muted-foreground">Analyse de la performance financière</p>
//         </div>
//         <div className="flex items-center gap-2">
//           <Popover>
//             <PopoverTrigger asChild>
//               <Button variant="outline" className="flex items-center gap-2 bg-transparent">
//                 <CalendarIcon className="h-4 w-4" />
//                 {format(dateRange.from, "dd MMM", { locale: fr })} - {format(dateRange.to, "dd MMM", { locale: fr })}
//               </Button>
//             </PopoverTrigger>
//             <PopoverContent className="w-auto p-0" align="end">
//               <div className="p-3 space-y-3">
//                 <div className="grid grid-cols-2 gap-2">
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() =>
//                       setDateRange({
//                         from: new Date(new Date().setDate(new Date().getDate() - 7)),
//                         to: new Date(),
//                       })
//                     }
//                   >
//                     7 jours
//                   </Button>
//                   <Button
//                     variant="outline"
//                     size="sm"
//                     onClick={() =>
//                       setDateRange({
//                         from: new Date(new Date().setDate(new Date().getDate() - 30)),
//                         to: new Date(),
//                       })
//                     }
//                   >
//                     30 jours
//                   </Button>
//                 </div>
//                 <Calendar
//                   mode="range"
//                   selected={{ from: dateRange.from, to: dateRange.to }}
//                   onSelect={(range) => {
//                     if (range?.from && range?.to) {
//                       setDateRange({ from: range.from, to: range.to })
//                     }
//                   }}
//                   numberOfMonths={1}
//                 />
//               </div>
//             </PopoverContent>
//           </Popover>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Valeur Stock Total</CardTitle>
//             <BarChart3 className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalStockValue.toFixed(2)} €</div>
//             <p className="text-xs text-muted-foreground">Valeur actuelle de l'inventaire</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Investissement Total</CardTitle>
//             <DollarSign className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{totalInvestment.toFixed(2)} €</div>
//             <p className="text-xs text-muted-foreground">Capital investi sur la période</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Mouvement Total</CardTitle>
//             {totalMovement >= 0 ? (
//               <TrendingUp className="h-4 w-4 text-green-600" />
//             ) : (
//               <TrendingDown className="h-4 w-4 text-red-600" />
//             )}
//           </CardHeader>
//           <CardContent>
//             <div className={`text-2xl font-bold ${totalMovement >= 0 ? "text-green-600" : "text-red-600"}`}>
//               {totalMovement >= 0 ? "+" : ""}
//               {totalMovement.toFixed(2)} €
//             </div>
//             <p className="text-xs text-muted-foreground">Flux financier sur la période</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Profit/Perte</CardTitle>
//             {totalProfitLoss >= 0 ? (
//               <TrendingUp className="h-4 w-4 text-green-600" />
//             ) : (
//               <TrendingDown className="h-4 w-4 text-red-600" />
//             )}
//           </CardHeader>
//           <CardContent>
//             <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
//               {totalProfitLoss >= 0 ? "+" : ""}
//               {totalProfitLoss.toFixed(2)} €
//             </div>
//             <div className="flex items-center gap-1">
//               <Badge variant={profitMargin >= 0 ? "default" : "destructive"} className="text-xs">
//                 {profitMargin >= 0 ? "+" : ""}
//                 {profitMargin.toFixed(1)}%
//               </Badge>
//               <p className="text-xs text-muted-foreground">marge</p>
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {loading ? (
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-center">
//               <div className="text-muted-foreground">Chargement des données financières...</div>
//             </div>
//           </CardContent>
//         </Card>
//       ) : (
//         <Card>
//           <CardHeader>
//             <CardTitle>Détail par Jour</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-2 max-h-96 overflow-y-auto">
//               {summaries.map((summary, index) => (
//                 <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
//                   <div className="flex items-center gap-3">
//                     <div className="text-sm font-medium">{format(summary.date, "dd MMM yyyy", { locale: fr })}</div>
//                   </div>
//                   <div className="flex items-center gap-4 text-sm">
//                     <div className="text-right">
//                       <div className="font-medium">Stock: {summary.totalStockValue.toFixed(2)} €</div>
//                       <div className="text-muted-foreground">Invest: {summary.totalInvestment.toFixed(2)} €</div>
//                     </div>
//                     <div className="text-right">
//                       <div className={`font-medium ${summary.dailyMovement >= 0 ? "text-green-600" : "text-red-600"}`}>
//                         {summary.dailyMovement >= 0 ? "+" : ""}
//                         {summary.dailyMovement.toFixed(2)} €
//                       </div>
//                       <div className={`text-xs ${summary.profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
//                         P/L: {summary.profitLoss >= 0 ? "+" : ""}
//                         {summary.profitLoss.toFixed(2)} €
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   )
// }

// export { FinancialSummaryComponent as FinancialSummary }
