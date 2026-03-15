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
  visibleColumns?: string[]
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
    <div className="flex items-center space-x-2 text-xs font-semibold">
      {counts.critical > 0 && <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">Critical: {counts.critical}</span>}
      {counts.high > 0 && <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">High: {counts.high}</span>}
      {counts.medium > 0 && <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">Medium: {counts.medium}</span>}
      {counts.low > 0 && <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">Low: {counts.low}</span>}
      {(counts.critical === 0 && counts.high === 0 && counts.medium === 0 && counts.low === 0) && (
        <span className="text-muted-foreground font-normal text-sm">0 Issues</span>
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

export function ScoreFactorTable({ data, visibleColumns = ['Factor', 'Score', 'Impact', 'Issues', 'Findings'] }: ScoreFactorTableProps) {
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
    <div className="rounded-md border border-[#d4d4d8] bg-card overflow-hidden">
      <Table className="border-collapse">
        <TableHeader>
          <TableRow className="bg-[#f9f9fb] border-b-[#d4d4d8] hover:bg-[#f9f9fb]">
            <TableHead className="w-[50px]"></TableHead>
            {visibleColumns.includes('Factor') && <TableHead className="font-semibold">Factor</TableHead>}
            {visibleColumns.includes('Score') && <TableHead className="font-semibold">Score</TableHead>}
            {visibleColumns.includes('Impact') && <TableHead className="font-semibold">Impact</TableHead>}
            {visibleColumns.includes('Issues') && <TableHead className="font-semibold">Issues</TableHead>}
            {visibleColumns.includes('Findings') && <TableHead className="font-semibold text-right">Findings</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((factor) => (
            <React.Fragment key={factor.id}>
              <TableRow className="hover:bg-muted/30 group border-b-[#d4d4d8]">
                <TableCell className="cursor-pointer" onClick={() => toggleRow(factor.id)}>
                  {expandedRows.has(factor.id) ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground" />
                  )}
                </TableCell>
                {visibleColumns.includes('Factor') && <TableCell className="font-medium">{factor.title}</TableCell>}
                {visibleColumns.includes('Score') && <TableCell><GradeIcon score={factor.score} /></TableCell>}
                {visibleColumns.includes('Impact') && <TableCell><ImpactBadge impact={factor.impact} /></TableCell>}
                {visibleColumns.includes('Issues') && <TableCell><SeverityCounts counts={factor.issues} /></TableCell>}
                {visibleColumns.includes('Findings') && (
                  <TableCell className="text-right text-muted-foreground">
                    {factor.findingsCount > 0 ? (
                      <span className="font-medium text-foreground">{factor.findingsCount}</span>
                    ) : (
                      factor.findingsCount
                    )}
                  </TableCell>
                )}
              </TableRow>
              
              {/* Expanded Nested Issues */}
              {expandedRows.has(factor.id) && factor.nestedIssues && factor.nestedIssues.length > 0 && (
                <TableRow className="bg-muted/10 hover:bg-muted/10 border-b-[#d4d4d8]">
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
                            <div className="flex items-center space-x-3 w-1/3">
                              <span className="text-sm font-medium hover:underline decoration-muted-foreground underline-offset-4 truncate" title={issue.title}>
                                {issue.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-muted-foreground w-2/3 justify-end">
                              <span className="w-16 text-right">
                                {issue.impact > 0 ? <ImpactBadge impact={issue.impact} /> : <span className="text-muted-foreground/50">-</span>}
                              </span>
                              <span className="w-24 text-right">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  issue.severity === 'Critical' || issue.severity === 'High' ? 'bg-red-100 text-red-800' :
                                  issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {issue.severity}
                                </span>
                              </span>
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
