"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { BugIcon } from "lucide-react"

interface DebugResponseProps {
    response: string
}

export function DebugResponse({ response }: DebugResponseProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <Card className="mt-4">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                    <BugIcon className="h-4 w-4" />
                    Debug: AI Response
                    <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="ml-auto h-6 text-xs">
                        {isExpanded ? "Hide" : "Show"}
                    </Button>
                </CardTitle>
            </CardHeader>
            {isExpanded && (
                <CardContent>
                    <div className="max-h-60 overflow-auto rounded bg-muted p-2 text-xs">
                        <pre>{response}</pre>
                    </div>
                </CardContent>
            )}
        </Card>
    )
}
