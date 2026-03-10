'use client'

import { useTheme } from '@/lib/theme'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="neu-button p-2 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-[#1E293B]" />
      ) : (
        <Sun className="w-5 h-5 text-[#f3b14c]" />
      )}
    </button>
  )
}
