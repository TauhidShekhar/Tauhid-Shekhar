import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Community Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-[#121217] border border-white/5 rounded-3xl flex flex-col items-center gap-4 m-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center text-red-500 text-xl font-bold">✕</div>
          <h3 className="text-lg font-bold text-white">Something went wrong</h3>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            An unexpected error occurred in the community platform. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-650 hover:bg-purple-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
