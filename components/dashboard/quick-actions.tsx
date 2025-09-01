"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Package, TrendingUp, Download } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "Nouveau Mouvement",
      description: "Ajouter entrée/sortie stock",
      icon: Plus,
      href: "/data-entry",
      variant: "default" as const,
    },
    {
      title: "Voir Stock",
      description: "Consulter l'inventaire",
      icon: Package,
      href: "/stock",
      variant: "outline" as const,
    },
    {
      title: "Analyse Financière",
      description: "Rapports et graphiques",
      icon: TrendingUp,
      href: "/financial",
      variant: "outline" as const,
    },
    {
      title: "Exporter Données",
      description: "Télécharger rapports",
      icon: Download,
      href: "/reports",
      variant: "outline" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions Rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start gap-2"
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center gap-2 w-full">
                  <action.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{action.title}</span>
                </div>
                <span className="text-xs text-muted-foreground text-left">{action.description}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
