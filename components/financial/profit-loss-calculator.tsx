// "use client"

// import { useState, useEffect } from "react"
// import type { Product } from "@/lib/types"
// import { dataService } from "@/lib/data-service"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Badge } from "@/components/ui/badge"
// import { Calculator, TrendingUp, TrendingDown } from "lucide-react"

// interface ProductProfitLoss {
//   product: Product
//   totalInvestment: number
//   currentValue: number
//   profitLoss: number
//   profitMargin: number
//   currentStock: number
// }

// export function ProfitLossCalculator() {
//   const [productPL, setProductPL] = useState<ProductProfitLoss[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     const calculateProfitLoss = async () => {
//       try {
//         const [products, stockEntries] = await Promise.all([dataService.getProducts(), dataService.getStockEntries()])

//         const calculations = products.map((product) => {
//           const productEntries = stockEntries.filter((entry) => entry.productId === product.id)

//           // Calculate total investment (sum of all purchases)
//           const totalInvestment = productEntries
//             .filter((entry) => entry.quantityIn > 0)
//             .reduce((sum, entry) => sum + entry.quantityIn * entry.unitPrice, 0)

//           // Get current stock
//           const latestEntry = productEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
//           const currentStock = latestEntry?.currentStock || 0

//           // Calculate current value
//           const currentValue = currentStock * product.unitPrice

//           // Calculate profit/loss
//           const profitLoss = currentValue - totalInvestment
//           const profitMargin = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0

//           return {
//             product,
//             totalInvestment,
//             currentValue,
//             profitLoss,
//             profitMargin,
//             currentStock,
//           }
//         })

//         setProductPL(calculations.sort((a, b) => b.profitLoss - a.profitLoss))
//       } catch (error) {
//         console.error("Erreur lors du calcul des profits/pertes:", error)
//       } finally {
//         setLoading(false)
//       }
//     }

//     calculateProfitLoss()
//   }, [])

//   const totalInvestment = productPL.reduce((sum, item) => sum + item.totalInvestment, 0)
//   const totalCurrentValue = productPL.reduce((sum, item) => sum + item.currentValue, 0)
//   const totalProfitLoss = totalCurrentValue - totalInvestment
//   const overallMargin = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0

//   if (loading) {
//     return (
//       <Card>
//         <CardContent className="p-6">
//           <div className="flex items-center justify-center">
//             <div className="text-muted-foreground">Calcul des profits/pertes...</div>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Calculator className="h-5 w-5" />
//             Résumé Profit/Perte Global
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div className="text-center p-4 border rounded-lg">
//               <div className="text-2xl font-bold">{totalInvestment.toFixed(2)} €</div>
//               <div className="text-sm text-muted-foreground">Investissement Total</div>
//             </div>
//             <div className="text-center p-4 border rounded-lg">
//               <div className="text-2xl font-bold">{totalCurrentValue.toFixed(2)} €</div>
//               <div className="text-sm text-muted-foreground">Valeur Actuelle</div>
//             </div>
//             <div className="text-center p-4 border rounded-lg">
//               <div className={`text-2xl font-bold ${totalProfitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
//                 {totalProfitLoss >= 0 ? "+" : ""}
//                 {totalProfitLoss.toFixed(2)} €
//               </div>
//               <div className="text-sm text-muted-foreground">Profit/Perte</div>
//             </div>
//             <div className="text-center p-4 border rounded-lg">
//               <div className={`text-2xl font-bold ${overallMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
//                 {overallMargin >= 0 ? "+" : ""}
//                 {overallMargin.toFixed(1)}%
//               </div>
//               <div className="text-sm text-muted-foreground">Marge Globale</div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Détail par Produit</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Produit</TableHead>
//                 <TableHead>Stock Actuel</TableHead>
//                 <TableHead>Investissement</TableHead>
//                 <TableHead>Valeur Actuelle</TableHead>
//                 <TableHead>Profit/Perte</TableHead>
//                 <TableHead>Marge</TableHead>
//                 <TableHead>Performance</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {productPL.map((item) => (
//                 <TableRow key={item.product.id}>
//                   <TableCell>
//                     <div>
//                       <div className="font-medium">{item.product.name}</div>
//                       <div className="text-sm text-muted-foreground">{item.product.category?.name}</div>
//                     </div>
//                   </TableCell>
//                   <TableCell className="text-center">{item.currentStock}</TableCell>
//                   <TableCell>{item.totalInvestment.toFixed(2)} €</TableCell>
//                   <TableCell>{item.currentValue.toFixed(2)} €</TableCell>
//                   <TableCell className={item.profitLoss >= 0 ? "text-green-600" : "text-red-600"}>
//                     {item.profitLoss >= 0 ? "+" : ""}
//                     {item.profitLoss.toFixed(2)} €
//                   </TableCell>
//                   <TableCell className={item.profitMargin >= 0 ? "text-green-600" : "text-red-600"}>
//                     {item.profitMargin >= 0 ? "+" : ""}
//                     {item.profitMargin.toFixed(1)}%
//                   </TableCell>
//                   <TableCell>
//                     <Badge
//                       variant={item.profitLoss >= 0 ? "default" : "destructive"}
//                       className="flex items-center gap-1 w-fit"
//                     >
//                       {item.profitLoss >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
//                       {item.profitLoss >= 0 ? "Profitable" : "Perte"}
//                     </Badge>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
