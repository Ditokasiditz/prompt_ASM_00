'use client'

import * as React from "react"
import { Monitor } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AssetCounterProps {
    totalAssets: number
    className?: string
}

export function AssetCounter({ totalAssets, className }: AssetCounterProps) {
    return (
        <Card className={cn("border-2 border-blue-500/20 bg-blue-500/5 shadow-sm hover:shadow-md transition-all", className)}>
            <CardContent className="pt-6 pb-5 px-6">
                <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Assets Monitored
                        </span>
                        <span className="text-4xl font-extrabold tracking-tighter text-foreground">
                            {totalAssets}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                            Total assets under surveillance
                        </span>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/20">
                        <Monitor className="h-6 w-6 text-blue-500" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
