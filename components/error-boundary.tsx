"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="w-full h-screen bg-black flex items-center justify-center">
          <Card className="bg-gray-900 border-gray-700 max-w-md">
            <CardContent className="p-6 text-center">
              <h2 className="text-xl font-bold text-white mb-4 luminari">Something went wrong</h2>
              <p className="text-gray-300 mb-4 text-sm">
                The 3D experience encountered an error. This might be due to browser compatibility issues.
              </p>
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="bg-orange-500 hover:bg-orange-600 text-white luminari"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
