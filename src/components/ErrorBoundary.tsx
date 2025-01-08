'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="p-6 max-w-md w-full">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Algo salió mal</h2>
              <p className="text-gray-600 mb-4">
                Ha ocurrido un error inesperado. Por favor, intenta de nuevo o contacta a soporte si el problema persiste.
              </p>
              {this.state.error && (
                <pre className="bg-gray-100 p-4 rounded text-sm text-left w-full mb-4 overflow-auto">
                  {this.state.error.message}
                </pre>
              )}
              <div className="space-x-4">
                <Button onClick={this.handleRetry}>
                  Intentar de nuevo
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                >
                  Ir al inicio
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
