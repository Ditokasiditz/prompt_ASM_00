'use client'

import * as React from "react"
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ScoreGradeProps {
    score: number;
    grade: string;
}

export function ScoreGrade({ score, grade }: ScoreGradeProps) {
    // Determine color based on grade
    let colorClass = "text-red-500";
    let bgClass = "bg-red-500/10";
    let borderClass = "border-red-500/20";
    let Icon = ShieldAlert;

    if (grade === 'A' || grade === 'B') {
        colorClass = "text-green-500";
        bgClass = "bg-green-500/10";
        borderClass = "border-green-500/20";
        Icon = ShieldCheck;
    } else if (grade === 'C') {
        colorClass = "text-yellow-500";
        bgClass = "bg-yellow-500/10";
        borderClass = "border-yellow-500/20";
        Icon = Shield;
    }

    return (
        <Card className={cn("overflow-hidden border-2", borderClass)}>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Overall Assessment</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                        <span className="text-5xl font-extrabold tracking-tighter">{score}</span>
                        <span className="text-sm text-muted-foreground mt-1">out of 100</span>
                    </div>
                    <div className={cn("flex items-center justify-center w-24 h-24 rounded-full border-4 shadow-sm", bgClass, borderClass)}>
                        <span className={cn("text-5xl font-black", colorClass)}>{grade}</span>
                    </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm">
                    <Icon className={cn("h-4 w-4", colorClass)} />
                    <span className="font-medium text-muted-foreground">
                        {grade === 'A' || grade === 'B' ? 'Good standing' : grade === 'C' ? 'Needs improvement' : 'Critical attention required'}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
