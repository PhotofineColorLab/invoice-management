"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useMobile } from "@/hooks/use-mobile"
export function Header() {
    const { setTheme, theme } = useTheme()
    const isMobile = useMobile()

    return (
        <header className="flex items-center justify-between">
            <div>
                <h1 className={`${isMobile ? "text-xl" : "text-3xl"} font-bold`}>
                    {isMobile ? "Invoice Manager" : "Invoice Management"}
                </h1>
                <p className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}>
                    Upload and categorize your invoices with AI
                </p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
            </Button>
        </header>
    )
}

