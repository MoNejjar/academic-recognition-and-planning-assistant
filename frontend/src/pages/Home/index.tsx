import { useState } from "react";
import PDFUploadPage from "../CourseMatching/PDFUploadPage";
import tumLogo from "../../assets/tum-logo.svg";

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div>
      {/* HEADER FIXE EN HAUT */}
      <header style={styles.header}>
        <img src={tumLogo} alt="TUM Logo" style={styles.logo} />
        <h1 style={styles.title}>Course Matching ARIP</h1>
      </header>

      {/* CONTENU PRINCIPAL */}
      <div style={styles.container}>
        <button style={styles.button} onClick={() => setModalOpen(true)}>
          Upload a PDF
        </button>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div style={styles.modalOverlay} onClick={() => setModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.closeButton}
              onClick={() => setModalOpen(false)}
            >
              X
            </button>
            <PDFUploadPage />
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#0051a2",
    color: "#fff",
    gap: "10px",
  },
  logo: {
    height: "40px",
  },
  title: {
    fontSize: "20px",
    margin: 0,
  },
  container: {
    height: "calc(100vh - 60px)", // moins la hauteur du header
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  button: {
    padding: "20px 40px",
    fontSize: "18px",
    cursor: "pointer",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0051a2",
    color: "#fff",
  },
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    minWidth: "500px",
    maxWidth: "90%",
    position: "relative" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  closeButton: {
    cursor: "pointer",
    border: "none",
    background: "none",
    fontSize: "18px",
    fontWeight: "bold" as const,
    alignSelf: "flex-end" as const,
  },
};
