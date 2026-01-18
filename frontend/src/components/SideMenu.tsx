// src/components/SideMenu.tsx
import { Link, useLocation } from "react-router-dom";

export default function SideMenu() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getStepNumber = (path: string) => {
    if (path === "/") return 0;
    if (path === "/mapping") return 1;
    if (path === "/catalogue") return 2;
    if (path === "/review") return 3;
    return -1;
  };

  const currentStep = getStepNumber(location.pathname);

  const linkStyle = (path: string): React.CSSProperties => {
    const stepNum = getStepNumber(path);
    const isPast = stepNum < currentStep;
    const isCurrent = isActive(path);

    return {
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "12px 16px",
      marginBottom: 8,
      borderRadius: 10,
      textDecoration: "none",
      color: isCurrent ? "#3b82f6" : isPast ? "#22c55e" : "#9ca3af",
      background: isCurrent ? "#eff6ff" : "transparent",
      fontWeight: isCurrent ? 600 : 500,
      transition: "all 0.2s",
    };
  };

  const stepCircleStyle = (path: string): React.CSSProperties => {
    const stepNum = getStepNumber(path);
    const isPast = stepNum < currentStep;
    const isCurrent = isActive(path);

    return {
      width: 28,
      height: 28,
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 13,
      fontWeight: 600,
      background: isPast ? "#22c55e" : isCurrent ? "#3b82f6" : "#e5e7eb",
      color: isPast || isCurrent ? "#fff" : "#9ca3af",
    };
  };

  return (
    <div style={{
      width: 260,
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      background: "linear-gradient(180deg, #f8fafc, #f1f5f9)",
      padding: 24,
      borderRight: "1px solid #e2e8f0",
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#1e293b",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          🎓 TUM Recognition
        </h2>
      </div>

      <div style={{
        fontSize: 11,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: 1,
        marginBottom: 16,
        fontWeight: 600,
      }}>
        Progress
      </div>

      <nav>
        <Link to="/" style={linkStyle("/")}>
          <span style={stepCircleStyle("/")}>
            {currentStep > 0 ? "✓" : "1"}
          </span>
          Personal Data
        </Link>
        <Link to="/mapping" style={linkStyle("/mapping")}>
          <span style={stepCircleStyle("/mapping")}>
            {currentStep > 1 ? "✓" : "2"}
          </span>
          Mapping Table
        </Link>
        <Link to="/catalogue" style={linkStyle("/catalogue")}>
          <span style={stepCircleStyle("/catalogue")}>
            {currentStep > 2 ? "✓" : "3"}
          </span>
          Catalogues
        </Link>
        <Link to="/review" style={linkStyle("/review")}>
          <span style={stepCircleStyle("/review")}>4</span>
          Review & Submit
        </Link>
      </nav>

      <div style={{
        position: "absolute",
        bottom: 24,
        left: 24,
        right: 24,
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)",
      }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Need help?</div>
        <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 500 }}>View Documentation →</div>
      </div>
    </div>
  );
}
