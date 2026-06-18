import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
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
    // Clear potentially corrupted state
    localStorage.removeItem('ecu_crm_user');
    localStorage.removeItem('ecu_crm_token');
    sessionStorage.removeItem('ecu_crm_user');
    sessionStorage.removeItem('ecu_crm_token');
    
    // Hard reset the browser to clear React state completely
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 selection:bg-red-500/30">
          <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-3">Error Crítico Detectado</h1>
              <p className="text-slate-400 text-sm mb-6">
                La aplicación encontró un estado inconsistente y detuvo su ejecución para evitar la corrupción de datos. 
                Esto puede ocurrir si tu sesión caducó o hay datos estructurales faltantes.
              </p>
              
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 w-full mb-8 overflow-auto max-h-32 text-left">
                <code className="text-xs text-red-400 break-all font-mono">
                  {this.state.error?.message || 'Error desconocido'}
                </code>
              </div>

              <button
                onClick={this.handleReset}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              >
                <RefreshCw className="w-5 h-5" />
                Reiniciar Aplicación
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
