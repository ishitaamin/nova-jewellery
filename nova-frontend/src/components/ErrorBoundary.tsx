import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
          <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="font-display text-3xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md mb-8">
            We apologize for the inconvenience. An unexpected error has occurred in the application.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-foreground text-background px-8 py-3 text-sm font-semibold uppercase tracking-wider hover:shadow-lg transition-all"
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;