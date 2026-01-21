import { NavLink, Outlet } from "react-router-dom";

export default function SideMenuLayout() {
  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>ARIP</h2>

        <nav style={styles.nav}>
          <NavLink to="/upload" style={styles.link}>
            Upload PDF
          </NavLink>
          <NavLink to="/form" style={styles.link}>
            Form
          </NavLink>
          <NavLink to="/review" style={styles.link}>
            Review
          </NavLink>
          <NavLink to="/course" style={styles.link}>
            Course
          </NavLink>
          <NavLink to="/submit" style={styles.link}>
            Submit
          </NavLink>
          <NavLink to="/reports" style={styles.link}>
            Reports
          </NavLink>
        </nav>
      </aside>

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: "220px",
    backgroundColor: "#0051a2",
    color: "#fff",
    padding: "20px",
  },
  logo: {
    marginBottom: "30px",
  },
  nav: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    fontSize: "16px",
  },
  content: {
    flex: 1,
    padding: "30px",
    backgroundColor: "#f5f5f5",
    overflowY: "auto" as const,
  },
};
