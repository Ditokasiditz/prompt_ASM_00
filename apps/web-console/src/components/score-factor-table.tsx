import * as React from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export interface IssueDef {
  id: number
  title: string
  severity: "Critical" | "High" | "Medium" | "Low"
  impact: number
  findingsCount: number
}

export interface FactorDef {
  id: number
  title: string
  score: number
  impact: number
  findingsCount: number
  issues: {
    critical: number
    high: number
    medium: number
    low: number
  }
  nestedIssues: IssueDef[]
}

interface ScoreFactorTableProps {
  data: FactorDef[]
}

const GradeIcon = ({ score }: { score: number }) => {
  let color = "text-green-500 border-green-500"
  let grade = "A"
  if (score < 60) {
    color = "text-red-500 border-red-500"
    grade = "F"
  } else if (score < 80) {
    color = "text-orange-500 border-orange-500"
    grade = "C"
  } else if (score < 90) {
    color = "text-yellow-500 border-yellow-500"
    grade = "B"
  }

  return (
    <div className={`flex items-center space-x-2`}>
      <span className={`flex h-7 w-7 items-center justify-center rounded border-2 font-bold ${color}`}>
        {grade}
      </span>
      <span className="font-medium text-foreground">{score}</span>
    </div>
  )
}

const SeverityCounts = ({ counts }: { counts: { critical: number, high: number, medium: number, low: number } }) => {
  return (
    <div className="flex items-center space-x-3 text-sm">
      {counts.critical > 0 && <span className="text-red-600 font-medium">Critical: {counts.critical}</span>}
      {counts.high > 0 && <span className="text-red-500 font-medium">High: {counts.high}</span>}
      {counts.medium > 0 && <span className="text-orange-500 font-medium">Medium: {counts.medium}</span>}
      {counts.low > 0 && <span className="text-yellow-500 font-medium">Low: {counts.low}</span>}
      {(counts.critical === 0 && counts.high === 0 && counts.medium === 0 && counts.low === 0) && (
        <span className="text-muted-foreground">0 Issues</span>
      )}
    </div>
  )
}

const ImpactBadge = ({ impact }: { impact: number }) => {
  return (
    <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
      ↘ {impact.toFixed(1)}
    </span>
  )
}

export function ScoreFactorTable({ data }: ScoreFactorTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set())
  const router = useRouter()

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id)
    } else {
      newExpandedRows.add(id)
    }
    setExpandedRows(newExpandedRows)
  }

  const handleIssueClick = (title: string) => {
    // Navigate to issue detail page
    const encodedTitle = encodeURIComponent(title)
    router.push(`/issues/${encodedTitle}`)
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="font-semibold">Factor</TableHead>
            <TableHead className="font-semibold">Score</TableHead>
            <TableHead className="font-semibold">Impact</TableHead>
            <TableHead className="font-semibold">Issues</TableHead>
            <TableHead className="font-semibold text-right">Findings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((factor) => (
            <React.Fragment key={factor.id}>
              <TableRow 
                className="cursor-pointer hover:bg-muted/30 group"
                onClick={() => toggleRow(factor.id)}
              >
                <TableCell>
                  {expandedRows.has(factor.id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{factor.title}</TableCell>
                <TableCell>
                  <GradeIcon score={factor.score} />
                </TableCell>
                <TableCell>
                  <ImpactBadge impact={factor.impact} />
                </TableCell>
                <TableCell>
                  <SeverityCounts counts={factor.issues} />
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {factor.findingsCount > 0 ? (
                    <span className="font-medium text-foreground">{factor.findingsCount}</span>
                  ) : (
                    factor.findingsCount
                  )}
                </TableCell>
              </TableRow>
              
              {/* Expanded Nested Issues */}
              {expandedRows.has(factor.id) && factor.nestedIssues && factor.nestedIssues.length > 0 && (
                <TableRow className="bg-muted/10 hover:bg-muted/10">
                  <TableCell colSpan={6} className="p-0 border-b-0">
                    <div className="py-3 px-6 ml-6 border-l-2 border-primary/20 bg-background/50">
                      <p className="text-sm text-muted-foreground mb-3 font-medium">Issues detected under {factor.title}</p>
                      <ul className="space-y-2">
                        {factor.nestedIssues.map((issue) => (
                          <li 
                            key={issue.id} 
                            onClick={() => handleIssueClick(issue.title)}
                            className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors border border-transparent hover:border-border"
                          >
                            <div className="flex items-center space-x-3">
                              <span className={`w-2 h-2 rounded-full ${
                                issue.severity === 'Critical' ? 'bg-red-600' :
                                issue.severity === 'High' ? 'bg-red-500' :
                                issue.severity === 'Medium' ? 'bg-orange-500' : 'bg-yellow-500'
                              }`} />
                              <span className="text-sm font-medium hover:underline decoration-muted-foreground underline-offset-4 w-[300px] truncate" title={issue.title}>
                                {issue.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-8 text-sm text-muted-foreground min-w-[300px] justify-end">
                              <span className="w-16 text-right">
                                {issue.impact > 0 ? <ImpactBadge impact={issue.impact} /> : <span className="text-muted-foreground/50">-</span>}
                              </span>
                              <span className="w-20 text-right">{issue.severity}</span>
                              <span className="w-16 text-right font-medium">{issue.findingsCount}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
