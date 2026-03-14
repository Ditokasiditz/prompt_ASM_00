'use client'

import React, { useEffect, useState } from "react"
import { ShieldAlert, LayoutDashboard, Activity, Users, Settings, ShieldCheck } from "lucide-react"

import { Sidebar } from "@/components/sidebar"
import { ScoreFactorTable, FactorDef } from "@/components/score-factor-table"

export default function ScoreFactorPage() {
  const [data, setData] = useState<FactorDef[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3001/api/factors')
      .then(res => res.json())
      .then((factors: FactorDef[]) => {
        setData(factors)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching factors data', error)
        setLoading(false)
      })
  }, [])

  const navigations = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
    { title: "Score Factor", href: "/score-factor", icon: ShieldCheck, isActive: true },
    { title: "Issues portfolio", href: "/issues", icon: ShieldAlert },
    { title: "Digital Footprint", href: "/assets", icon: Activity },
    { title: "Team", href: "/team", icon: Users },
    { title: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar navigations={navigations} />

      <main className="flex-1 overflow-y-auto bg-muted/10 p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Score Factor</h1>
              <p className="text-muted-foreground mt-2">
                Detailed breakdown of factors and their associated issues.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-muted-foreground mr-4">
                {data.length} rows
              </span>
              <button className="text-sm font-medium px-3 py-1.5 border border-input bg-background hover:bg-muted rounded-md transition-colors">
                Columns
              </button>
              <button className="text-sm font-medium px-3 py-1.5 border border-input bg-background hover:bg-muted rounded-md transition-colors">
                Full Screen
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center border rounded-md bg-card animate-pulse">
              <p className="text-muted-foreground">Loading factors...</p>
            </div>
          ) : (
            <ScoreFactorTable data={data} />
          )}
        </div>
      </main>
    </div>
  )
}
