'use client'

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface FactorProp {
    title: string;
    score: number;
    issueCount: number;
}

export function FactorBreakdown({ factorData }: { factorData: FactorProp[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {factorData.map((factor) => {
                // Determine coloring and badging
                let progressColor = "bg-green-500";
                if (factor.score < 70) progressColor = "bg-red-500";
                else if (factor.score < 90) progressColor = "bg-yellow-500";

                return (
                    <Card key={factor.title} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-semibold text-foreground/80">{factor.title}</CardTitle>
                            {factor.issueCount > 0 ? (
                                <Badge variant={factor.score < 70 ? "critical" : "warning"} className="ml-2">
                                    {factor.issueCount} {factor.issueCount === 1 ? 'Issue' : 'Issues'}
                                </Badge>
                            ) : (
                                <Badge variant="success" className="ml-2">Clean</Badge>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-4">{factor.score}</div>
                            <Progress value={factor.score} indicatorColor={progressColor} className="h-2" />
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
