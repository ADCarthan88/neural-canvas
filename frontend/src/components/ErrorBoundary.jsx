/**
 * 🛡️ ERROR BOUNDARY
 * Catches and handles all React errors gracefully
 */

'use client';

import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Neural Canvas Error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // Analytics or error reporting service
      console.log('Production error logged:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReset = () => {
    // Clear localStorage and reload
    try {
      localStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error('Failed to reset:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            border: '2px solid #ff0000',
            borderRadius: '15px',
            padding: '30px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>🚨</h1>
            <h2 style={{ fontSize: '24px', marginBottom: '20px', color: '#ff6666' }}>
              Neural Canvas Error
            </h2>
            
            <p style={{ fontSize: '16px', marginBottom: '20px', color: '#ccc' }}>
              Something went wrong with the Neural Canvas. Don't worry, we can fix this!
            </p>
            
            {this.state.retryCount < 3 && (
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '15px 30px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ff6600',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginRight: '15px',
                  marginBottom: '15px'
                }}
              >
                🔄 Try Again ({3 - this.state.retryCount} attempts left)
              </button>
            )}
            
            <button
              onClick={this.handleReset}
              style={{
                padding: '15px 30px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#666',
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginBottom: '15px'
              }}
            >
              🔧 Reset Everything
            </button>
            
            <div style={{
              marginTop: '20px',
              padding: '15px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#aaa',
              textAlign: 'left'
            }}>
              <strong>Error Details:</strong><br/>
              {this.state.error && this.state.error.message}<br/>
              <br/>
              <strong>Quick Fixes:</strong><br/>
              • Refresh the page (F5)<br/>
              • Clear browser cache<br/>
              • Try a different browser<br/>
              • Check internet connection<br/>
              • Disable browser extensions
            </div>
            
            <div style={{ marginTop: '15px', fontSize: '14px', color: '#888' }}>
              Neural Canvas v5.0 | Error ID: {Date.now()}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;