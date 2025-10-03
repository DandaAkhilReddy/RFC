import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { errorLogger } from '../utils/errorLogger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log to centralized error logger
    errorLogger.logError({
      errorType: 'ReactErrorBoundary',
      message: error.message || 'Unknown React error',
      stack: error.stack,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    // Reload the page to reset the app state
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 border-2 border-red-200">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
              Oops! Something went wrong
            </h1>

            {/* Error Message */}
            <p className="text-center text-gray-600 mb-6">
              We encountered an unexpected error. Don't worry, we're working on it!
            </p>

            {/* Error Details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl overflow-auto max-h-64">
                <h3 className="font-bold text-red-800 mb-2">Error Details:</h3>
                <pre className="text-sm text-red-700 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <>
                    <h4 className="font-bold text-red-800 mt-4 mb-2">Component Stack:</h4>
                    <pre className="text-xs text-red-600 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reload App</span>
              </button>

              <button
                onClick={() => window.history.back()}
                className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:shadow-xl hover:border-orange-400 transition-all transform hover:scale-105"
              >
                Go Back
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-xl">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">If this problem persists:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Try clearing your browser cache and cookies</li>
                    <li>Make sure you're using the latest browser version</li>
                    <li>Check your internet connection</li>
                    <li>Contact support at hello@reddyfit.app</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
