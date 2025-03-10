"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangleIcon } from "lucide-react"

interface ParsingErrorProps {
    onRetry: () => void
}

export function ParsingError({ onRetry }: ParsingErrorProps) {
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangleIcon className="h-5 w-5" />
                    Processing Error
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="mb-4">
                    We encountered an issue while processing your document. The AI model may have had trouble extracting
                    structured data from this particular file format or content.
                </p>
                <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">You can try:</p>
                    <ul className="list-disc pl-5 text-sm text-muted-foreground">
                        <li>Uploading a clearer or more standard invoice format</li>
                        <li>Using a PDF instead of an image if possible</li>
                        <li>Ensuring the document contains clear invoice information</li>
                    </ul>
                </div>
                <Button onClick={onRetry} className="mt-4">
                    Try Again
                </Button>
            </CardContent>
        </Card>
    )
}

