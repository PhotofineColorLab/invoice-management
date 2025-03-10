"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "next-themes"

export function Header() {
    const { setTheme, theme } = useTheme()

    return (
        <header className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold">Invoice Management</h1>
                <p className="text-muted-foreground">Upload and categorize your invoices with AI</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                <span className="sr-only">Toggle theme</span>
            </Button>
        </header>
    )
}

