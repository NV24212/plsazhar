import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 text-sm">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              className="mt-3 text-sm text-red-700 underline hover:no-underline"
              onClick={() =>
                this.setState({ hasError: false, error: undefined })
              }
            >
              Try again
            </button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
