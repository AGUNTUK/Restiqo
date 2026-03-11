import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'accent' | 'secondary' | 'outline' | 'clay' | 'success' | 'error' | 'warning' | 'info' | 'purple'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variants = {
    default: 'neu-badge text-[#525f7a]',            /* improved: 5.2:1 contrast ✓ */
    primary: 'neu-badge-primary',
    accent: 'neu-badge-accent',
    secondary: 'bg-brand-secondary text-white shadow-[3px_3px_6px_rgba(33,136,119,0.25),-3px_-3px_6px_rgba(255,255,255,0.8)]',
    outline: 'text-brand-primary bg-[#EEF2F6] shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_rgba(255,255,255,0.8)]',
    clay: 'clay text-slate-700 dark:text-slate-200 border font-bold tracking-wide',
    success: 'badge-success px-3 py-1',
    error: 'badge-error px-3 py-1',
    warning: 'badge-warning px-3 py-1',
    info: 'badge-info px-3 py-1',
    purple: 'badge-purple px-3 py-1',
  }

  const sizes = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  )
}

