"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ValidationResultsProps {
    results: {
        category: string
        itemIndex: number
        itemName: string
        fixedFields: string[]
    }[]
    onClose: () => void
}

export function ValidationResults({ results, onClose }: ValidationResultsProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    const totalFixed = results.reduce((acc, result) => acc + result.fixedFields.length, 0)
    const itemsFixed = new Set(results.map((r) => `${r.category}-${r.itemIndex}`)).size

    return (
        <Card className="mt-4 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-base">AI Data Validation Results</CardTitle>
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        {totalFixed} issues fixed
                    </Badge>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-8 w-8 p-0">
                        {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <span className="sr-only">Close</span>
                        <span aria-hidden>×</span>
                    </Button>
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                        AI detected and fixed {totalFixed} data inconsistencies across {itemsFixed} items.
                    </p>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {results.map((result, idx) => (
                            <div key={idx} className="text-sm border rounded-md p-2">
                                <div className="font-medium">
                                    {result.category.charAt(0).toUpperCase() + result.category.slice(1)}: {result.itemName}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">Fixed fields: {result.fixedFields.join(", ")}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    )
}

