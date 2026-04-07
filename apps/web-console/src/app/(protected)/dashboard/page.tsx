'use client'

import React, { useEffect, useState } from "react"
import { ScoreGrade } from "@/components/score-grade"
import { FactorBreakdown } from "@/components/factor-breakdown"
import { SeverityPieChart } from "@/components/severity-pie-chart"
import { AssetCounter } from "@/components/asset-counter"
import { API_BASE } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldAlert, LayoutGrid } from "lucide-react"

interface Factor {
  title: string
  score: number
  issueCount: number
}

interface DashboardData {
  score: number
  grade: string
  factors: Factor[]
  assetCount: number
  exposedCount: number
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  colorClass,
  borderClass,
  bgClass,
}: {
  label: string
  value: string | number
  sub: string
  icon: React.ElementType
  colorClass: string
  borderClass: string
  bgClass: string
}) {
  return (
    <Card className={`border-2 ${borderClass} ${bgClass} shadow-sm hover:shadow-md transition-all`}>
      <CardContent className="pt-6 pb-5 px-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {label}
            </span>
            <span className="text-4xl font-extrabold tracking-tighter text-foreground">
              {value}
            </span>
            <span className="text-xs text-muted-foreground mt-1">{sub}</span>
          </div>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl border ${borderClass} ${bgClass.replace('/5', '/15')}`}
          >
            <Icon className={`h-6 w-6 ${colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_BASE}/api/dashboard/summary`)
      .then(res => res.json())
      .then(dashboardData => {
        setData(dashboardData)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching dashboard data', error)
        setLoading(false)
      })
  }, [])

  if (loading || !data) {
    return (
      <main className="flex-1 overflow-y-auto bg-muted/10 p-8 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading dashboard data...</p>
      </main>
    )
  }

  const totalIssues = data.factors.reduce((sum, f) => sum + f.issueCount, 0)

  return (
    <main className="flex-1 overflow-y-auto bg-muted/10 p-8">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ── Page Header ─────────────────────────────────────── */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Attack Surface Summary</h1>
          <p className="text-muted-foreground">
            Continuous monitoring of your external attack surface and threat landscape.
          </p>
        </div>

        {/* ── Stats Row ───────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-3">
          <AssetCounter totalAssets={data.assetCount} />

          <StatCard
            label="Active Issues"
            value={totalIssues}
            sub="Open findings across all factors"
            icon={ShieldAlert}
            colorClass="text-rose-500"
            borderClass="border-rose-500/20"
            bgClass="bg-rose-500/5"
          />

          <StatCard
            label="Factors Tracked"
            value={data.factors.length}
            sub="Security domains monitored"
            icon={LayoutGrid}
            colorClass="text-violet-500"
            borderClass="border-violet-500/20"
            bgClass="bg-violet-500/5"
          />
        </div>

        {/* ── Main Cards: Score + Severity ─────────────────────── */}
        <div className="grid gap-6 md:grid-cols-2">
          <ScoreGrade score={data.score} grade={data.grade} />
          <SeverityPieChart />
        </div>

        {/* ── Factor Breakdown ─────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-semibold mb-4 tracking-tight text-foreground/80">
            Factor Breakdown
          </h2>
          <FactorBreakdown factorData={data.factors} />
        </div>

      </div>
    </main>
  )
}
