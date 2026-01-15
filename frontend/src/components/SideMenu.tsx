// src/components/SideMenu.tsx
import { Link } from "react-router-dom";

export default function SideMenu() {
  return (
    <div style={{
      width: "220px",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      backgroundColor: "#f0f0f0",
      padding: "20px",
      boxShadow: "2px 0px 5px rgba(0,0,0,0.1)"
    }}>
      <h2>Menu</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/review">Course Review</Link></li>
      </ul>
    </div>
  );
}
