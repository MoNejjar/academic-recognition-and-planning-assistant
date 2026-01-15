// utils/debug.ts

/**
 * Utility for detailed error logging
 */
export function logApiError(error: any, context: string) {
  console.group(`❌ API Error - ${context}`);
  
  if (error.response) {
    // Server response error
    console.error("Status:", error.response.status);
    console.error("Data:", error.response.data);
    console.error("Headers:", error.response.headers);
  } else if (error.request) {
    // No response received
    console.error("Request sent but no response:", error.request);
  } else {
    // Error setting up request
    console.error("Error:", error.message);
  }
  
  console.error("Config:", error.config);
  console.groupEnd();
  
  return {
    message: error.response?.data?.detail || error.message || "Unknown error",
    status: error.response?.status,
    data: error.response?.data
  };
}

/**
 * Simple ErrorBoundary component to catch React errors
 */
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: 32, 
          margin: 32, 
          background: "#fee", 
          border: "2px solid #f88",
          borderRadius: 8
        }}>
          <h2>❌ An error occurred</h2>
          <p>Please reload the page.</p>
          <details style={{ marginTop: 16 }}>
            <summary style={{ cursor: "pointer" }}>Error details</summary>
            <pre style={{ 
              marginTop: 8, 
              padding: 12, 
              background: "#fff", 
              overflow: "auto",
              fontSize: 12
            }}>
              {this.state.error?.toString()}
            </pre>
          </details>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: 16,
              padding: "8px 16px",
              background: "#f44336",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}