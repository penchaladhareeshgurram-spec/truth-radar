import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = this.state.error?.message || 'An unexpected error occurred.';
      let isFirestoreError = false;
      
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.operationType && parsed.error) {
          isFirestoreError = true;
          errorMessage = `Database Error (${parsed.operationType} at ${parsed.path}): ${parsed.error}`;
        }
      } catch (e) {
        // Not a JSON error string
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-500/30 rounded-xl p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6 text-red-400">
              <AlertTriangle className="w-10 h-10" />
              <h1 className="text-2xl font-bold text-slate-100">Something went wrong</h1>
            </div>
            
            <div className="bg-slate-950 rounded-lg p-4 mb-6 overflow-auto border border-slate-800">
              <p className="text-red-300 font-mono text-sm whitespace-pre-wrap break-words">
                {errorMessage}
              </p>
            </div>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
