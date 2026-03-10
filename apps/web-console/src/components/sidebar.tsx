import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
    navigations: {
        title: string
        icon: LucideIcon
        href: string
        isActive?: boolean
    }[]
}

export function Sidebar({ className, navigations }: SidebarProps) {
    return (
        <div className={cn("pb-12 h-screen w-64 border-r bg-muted/20 flex flex-col", className)}>
            <div className="space-y-4 py-4 flex-1">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Attack Surface
                    </h2>
                    <div className="space-y-1">
                        {navigations.map((item) => (
                            <a
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted transition-colors",
                                    item.isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            <div className="px-6 py-4 border-t border-muted/50">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">SC</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Sec Team</span>
                        <span className="text-xs text-muted-foreground">Admin</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
