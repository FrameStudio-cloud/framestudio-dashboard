import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-[#0f172a] p-8">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">!</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{this.state.error?.message || "An unexpected error occurred"}</p>
            <button onClick={() => window.location.reload()} className="text-xs font-medium bg-amber-600 text-white rounded-lg px-4 py-2 hover:bg-amber-500 transition-colors">
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
