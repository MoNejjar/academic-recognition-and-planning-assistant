import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const STATUS_COLORS = {
  success: { bg: "#e8f5e9", border: "#4CAF50" },
  error: { bg: "#ffebee", border: "#f44336" },
  loading: { bg: "#fff3e0", border: "#ff9800" },
};

export default function HealthCheck() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState<any>(null);
  const colors = STATUS_COLORS[status];

  const checkHealth = async () => {
    setStatus("loading");
    try {
      const res = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      setStatus("success");
      setMessage("✅ Backend connected and working");
      setDetails(res.data);
    } catch (error: any) {
      setStatus("error");
      if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK") {
        setMessage("❌ Cannot reach backend. Check if it's running.");
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
      setDetails(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: 16,
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        borderRadius: 8,
        padding: 12,
        maxWidth: 300,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontSize: 13,
        zIndex: 9999,
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: "bold" }}>
        {status === "loading" ? "⏳ Checking..." : message}
      </div>
      
      {details && (
        <details style={{ fontSize: 11, marginTop: 8 }}>
          <summary style={{ cursor: "pointer", color: "#666" }}>
            Technical details
          </summary>
          <pre
            style={{
              marginTop: 4,
              padding: 6,
              background: "#fff",
              borderRadius: 4,
              overflow: "auto",
              maxHeight: 150,
            }}
          >
            {JSON.stringify(details, null, 2)}
          </pre>
        </details>
      )}
      
      <button
        onClick={checkHealth}
        style={{
          marginTop: 8,
          padding: "4px 8px",
          background: "#2196F3",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 11,
        }}
      >
        🔄 Retest
      </button>
    </div>
  );
}