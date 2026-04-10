import { Link, useLocation } from "react-router-dom";

export function BottomTabs() {
  const location = useLocation();

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "space-around",
      padding: "1rem",
      backgroundColor: "#fff",
      borderTop: "1px solid #ccc"
    }}>
      <Link
        to="/"
        style={{
          textDecoration: "none",
          color: location.pathname === "/" ? "#007bff" : "#000",
          fontWeight: location.pathname === "/" ? "bold" : "normal"
        }}
      >
        Dashboard
      </Link>
      <Link
        to="/insights"
        style={{
          textDecoration: "none",
          color: location.pathname === "/insights" ? "#007bff" : "#000",
          fontWeight: location.pathname === "/insights" ? "bold" : "normal"
        }}
      >
        Insights
      </Link>
    </div>
  );
}