import React from 'react';
import { componentLoggers } from '@/lib/logger';

const { ui: logger } = componentLoggers;

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Component error', {
      componentStack: errorInfo.componentStack,
    }, error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800">
            Algo salió mal
          </h2>
          <p className="mt-2 text-sm text-red-600">
            {this.state.error?.message || 'Ha ocurrido un error inesperado'}
          </p>
          <button
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
            onClick={() => this.setState({ hasError: false })}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
