import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-surface min-h-screen flex items-center justify-center p-md">
          <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <h2 className="font-title-sm text-on-surface mb-sm">Terjadi Kesalahan</h2>
            <p className="text-body-sm text-on-surface-variant mb-md">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <pre className="bg-surface-container-high p-md rounded-lg text-body-sm text-on-surface overflow-auto max-h-64">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-md px-lg py-sm bg-secondary text-on-secondary rounded-lg font-body-md hover:brightness-110 transition-all"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
