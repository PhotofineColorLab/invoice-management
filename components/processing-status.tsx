import { Card, CardContent } from "./ui/card";
import { Loader2 } from "lucide-react";

export function ProcessingStatus() {
    return (
        <Card className="mt-8">
            <CardContent className="p-6 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-lg font-medium">Processing your file...</p>
                <p className="text-sm text-muted-foreground mt-1">
                    This may take a moment as we analyze and categorize the content.
                </p>
            </CardContent>
        </Card>
    )
}


