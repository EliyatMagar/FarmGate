// components/common/ErrorBoundary.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo?: React.ErrorInfo }>;
  onReset?: () => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false 
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // You can also log errors to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined 
    });
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} errorInfo={this.state.errorInfo} />;
      }
      
      // Default fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-red-600">⚠️</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 text-lg">
                We encountered an unexpected error. Please try again.
              </p>
            </div>

            {/* Error Details - Collapsible for debugging */}
            {this.state.error && (
              <details className="bg-gray-50 rounded-lg p-4 mb-6">
                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                  Error Details (for debugging)
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <strong className="text-sm text-gray-600">Error Message:</strong>
                    <pre className="mt-1 text-sm text-red-600 bg-red-50 p-3 rounded overflow-x-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  
                  {this.state.error.stack && (
                    <div>
                      <strong className="text-sm text-gray-600">Stack Trace:</strong>
                      <pre className="mt-1 text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto max-h-32 overflow-y-auto">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}

                  {this.state.errorInfo?.componentStack && (
                    <div>
                      <strong className="text-sm text-gray-600">Component Stack:</strong>
                      <pre className="mt-1 text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto max-h-32 overflow-y-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>🔄</span>
                <span>Try Again</span>
              </button>
              
              <button
                onClick={this.handleReload}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>🔄</span>
                <span>Reload Page</span>
              </button>
              
              <Link
                to="/dashboard"
                className="bg-gray-600 text-white px-6 py-3 rounded-xl hover:bg-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center space-x-2 text-center"
              >
                <span>🏠</span>
                <span>Go to Dashboard</span>
              </Link>
            </div>

            {/* Help Text */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                If the problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;