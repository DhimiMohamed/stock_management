// "use client"

// import type React from "react"

// import { useState } from "react"
// import { dataService } from "@/lib/data-service"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { useToast } from "@/hooks/use-toast"
// import { FolderPlus } from "lucide-react"

// export function CategoryForm() {
//   const [loading, setLoading] = useState(false)
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//   })
//   const { toast } = useToast()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!formData.name) {
//       toast({
//         title: "Erreur",
//         description: "Le nom de la catégorie est obligatoire",
//         variant: "destructive",
//       })
//       return
//     }

//     setLoading(true)
//     try {
//       await dataService.createCategory({
//         name: formData.name,
//         description: formData.description,
//       })

//       toast({
//         title: "Succès",
//         description: "Catégorie créée avec succès",
//       })

//       // Reset form
//       setFormData({
//         name: "",
//         description: "",
//       })
//     } catch (error) {
//       toast({
//         title: "Erreur",
//         description: "Erreur lors de la création de la catégorie",
//         variant: "destructive",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <FolderPlus className="h-5 w-5" />
//           Nouvelle Catégorie
//         </CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="categoryName">Nom de la Catégorie *</Label>
//             <Input
//               id="categoryName"
//               value={formData.name}
//               onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
//               placeholder="Ex: Électronique, Vêtements..."
//               required
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="categoryDescription">Description</Label>
//             <Textarea
//               id="categoryDescription"
//               value={formData.description}
//               onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
//               placeholder="Description de la catégorie..."
//               rows={3}
//             />
//           </div>

//           <Button type="submit" disabled={loading} className="w-full">
//             {loading ? "Création..." : "Créer la Catégorie"}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }
