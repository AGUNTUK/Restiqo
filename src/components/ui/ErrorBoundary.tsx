'use client'

import { Component, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'

interface ErrorBoundaryProps {
    children: ReactNode
    fallback?: ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({ errorInfo })

        // Log error to error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        // You can send this to an error tracking service like Sentry
        // if (process.env.NODE_ENV === 'production') {
        //   Sentry.captureException(error, { extra: errorInfo })
        // }
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    handleReload = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="neu-xl p-8 max-w-md w-full text-center"
                    >
                        <div className="neu-icon w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-amber-500" />
                        </div>

                        <h2 className="text-xl font-semibold text-[#1E293B] mb-2">
                            Something went wrong
                        </h2>

                        <p className="text-[#64748B] mb-6">
                            We encountered an unexpected error. Please try again or refresh the page.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 rounded-xl text-left">
                                <p className="text-sm font-mono text-red-600 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button
                                variant="outline"
                                onClick={this.handleRetry}
                                leftIcon={<RefreshCw className="w-4 h-4" />}
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="primary"
                                onClick={this.handleReload}
                            >
                                Refresh Page
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )
        }

        return this.props.children
    }
}

// Functional wrapper for use in components
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundaryWrapper(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        )
    }
}

