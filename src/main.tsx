import React, { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CRITICAL UNCAUGHT REACT ERROR:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', fontFamily: 'sans-serif', backgroundColor: '#fff', color: '#191c1d', minHeight: '100vh' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ba1a1a', borderRadius: '12px', padding: '24px', backgroundColor: '#fff5f5' }}>
            <h1 style={{ color: '#ba1a1a', fontSize: '22px', fontWeight: 'bold', marginBottom: '12px' }}>
              Error al renderizar Turnia
            </h1>
            <p style={{ fontSize: '14px', marginBottom: '16px', color: '#454652' }}>
              Se produjo el siguiente error en tiempo de ejecución:
            </p>
            <pre style={{ backgroundColor: '#191c1d', color: '#ff8080', padding: '16px', borderRadius: '8px', fontSize: '13px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.errorInfo?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#24389c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <RootErrorBoundary>
        <App />
      </RootErrorBoundary>
    </StrictMode>
  );
}
