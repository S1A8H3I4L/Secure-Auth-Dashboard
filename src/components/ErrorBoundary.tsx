import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      let isIndexError = false;
      let indexLink = "";

      try {
        const parsedError = JSON.parse(this.state.error?.message || "{}");
        if (parsedError.error && parsedError.error.includes("requires an index")) {
          isIndexError = true;
          errorMessage = "This view requires a database index that hasn't been created yet.";
          const match = parsedError.error.match(/https:\/\/console\.firebase\.google\.com[^\s"]+/);
          if (match) indexLink = match[0];
        } else {
          errorMessage = parsedError.error || this.state.error?.message || errorMessage;
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center text-red-500 mx-auto mb-8">
              <AlertCircle size={40} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-4">Something went wrong</h1>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              {errorMessage}
            </p>

            {isIndexError && indexLink && (
              <div className="mb-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-left">
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Action Required</p>
                <p className="text-sm text-indigo-900 font-medium mb-3">Please click the link below to create the required database index in your Firebase Console:</p>
                <a 
                  href={indexLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-indigo-600 break-all hover:underline"
                >
                  Create Firestore Index →
                </a>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-white text-slate-600 border border-slate-200 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
              >
                <Home size={18} />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
