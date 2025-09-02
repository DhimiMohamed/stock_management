// "use client"

// import { useState } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/hooks/use-toast"
// import { Upload, Download, FileText } from "lucide-react"

// export function BulkImport() {
//   const [csvData, setCsvData] = useState("")
//   const [loading, setLoading] = useState(false)
//   const { toast } = useToast()

//   const handleImport = async () => {
//     if (!csvData.trim()) {
//       toast({
//         title: "Erreur",
//         description: "Veuillez saisir des données CSV",
//         variant: "destructive",
//       })
//       return
//     }

//     setLoading(true)
//     try {
//       // Parse CSV data (simplified)
//       const lines = csvData.trim().split("\n")
//       const headers = lines[0].split(",").map((h) => h.trim())

//       if (headers.length < 4) {
//         throw new Error("Format CSV invalide")
//       }

//       // Process each line (mock implementation)
//       const products = lines.slice(1).map((line) => {
//         const values = line.split(",").map((v) => v.trim())
//         return {
//           name: values[0],
//           category: values[1],
//           price: Number.parseFloat(values[2]),
//           minStock: Number.parseInt(values[3]),
//         }
//       })

//       toast({
//         title: "Succès",
//         description: `${products.length} produits importés avec succès`,
//       })

//       setCsvData("")
//     } catch (error) {
//       toast({
//         title: "Erreur",
//         description: "Erreur lors de l'importation des données",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const downloadTemplate = () => {
//     const template = "Nom,Catégorie,Prix,Stock Minimum\nSmartphone,Électronique,599.99,5\nT-shirt,Vêtements,19.99,20"
//     const blob = new Blob([template], { type: "text/csv" })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement("a")
//     a.href = url
//     a.download = "template_produits.csv"
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Upload className="h-5 w-5" />
//           Import en Lot
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <div className="flex items-center gap-2">
//           <Button variant="outline" size="sm" onClick={downloadTemplate}>
//             <Download className="h-3 w-3 mr-1" />
//             Télécharger Modèle
//           </Button>
//           <span className="text-sm text-muted-foreground">Format: Nom,Catégorie,Prix,Stock Minimum</span>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="csvData">Données CSV</Label>
//           <Textarea
//             id="csvData"
//             value={csvData}
//             onChange={(e) => setCsvData(e.target.value)}
//             placeholder="Nom,Catégorie,Prix,Stock Minimum&#10;Smartphone,Électronique,599.99,5&#10;T-shirt,Vêtements,19.99,20"
//             rows={8}
//             className="font-mono text-sm"
//           />
//         </div>

//         <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
//           <FileText className="h-4 w-4 text-muted-foreground" />
//           <div className="text-sm text-muted-foreground">
//             <strong>Format requis:</strong> Une ligne par produit, séparée par des virgules. Première ligne = en-têtes
//             (Nom,Catégorie,Prix,Stock Minimum)
//           </div>
//         </div>

//         <Button onClick={handleImport} disabled={loading || !csvData.trim()} className="w-full">
//           {loading ? "Importation..." : "Importer les Produits"}
//         </Button>
//       </CardContent>
//     </Card>
//   )
// }
