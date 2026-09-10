import React from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💥 [WeatherGPT ErrorBoundary] Uncaught rendering exception:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6 animate-fadeIn">
            
            {/* Header Icon */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Interface State Recovered
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                A localized rendering anomaly occurred while processing atmospheric data streams. Your credentials, saved stations, and preferences remain fully intact.
              </p>
            </div>

            {/* Technical diagnostic details in development */}
            {this.state.error && (
              <div className="text-left bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-28">
                {this.state.error.toString()}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recover Interface</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-2.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 hover:text-white font-medium rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Full Reload</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              WeatherGPT Meteorological Grid • Fault-Tolerant Runtime
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
