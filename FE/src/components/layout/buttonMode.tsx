"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const isDark = theme === "dark"

    return (
        <button
            type="button"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${isDark ? "rotate-dark" : "rotate-light"}`}
            aria-label={isDark ? "Chuyển sang light mode" : "Chuyển sang dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
        >
            {isDark ? (
                <Sun className="theme-icon h-5 w-5 text-amber-500" />
            ) : (
                <Moon className="theme-icon h-5 w-5 text-sky-500" />
            )}
        </button>
    )
}
