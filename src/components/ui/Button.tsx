'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'accent' | 'outline' | 'ghost' | 'clay'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed border-none'

    const variants = {
      default: 'bg-brand-primary text-white hover:brightness-110 hover:shadow-md active:scale-95 transition-all duration-200',
      primary: 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 hover:brightness-110 active:scale-95 transition-all duration-200',
      accent: 'bg-brand-primary text-white shadow-lg shadow-brand-primary/25 hover:brightness-110 active:scale-95 transition-all duration-200',
      outline: 'bg-transparent text-brand-primary border-2 border-brand-primary/30 hover:bg-brand-primary/10 active:scale-95 transition-all duration-200',
      ghost: 'text-brand-primary hover:bg-brand-primary/10 transition-all duration-200',
      clay: 'clay-button active:scale-95 transition-all duration-200',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-1.5 rounded-xl',
      md: 'px-6 py-3 text-base gap-2 rounded-2xl',
      lg: 'px-8 py-4 text-lg gap-2.5 rounded-2xl',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="inline-flex">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button


