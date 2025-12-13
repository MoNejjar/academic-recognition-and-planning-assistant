import { useState } from "react";
import { uploadPDF } from "../../services/api/upload";

export default function PDFUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed");
      return;
    }
    setFile(file);
    setError("");
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      await uploadPDF(file);
      setFile(null); // reset input
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={styles.dropZone}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {file ? <p>{file.name}</p> : <p>Drag & drop a PDF here or click below</p>}
      </div>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        style={styles.input}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        style={styles.button}
      >
        {loading ? "Uploading..." : "Send PDF"}
      </button>

      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: "15px",
  },
  dropZone: {
    width: "100%",
    height: "150px",
    border: "2px dashed #999",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: "10px",
    textAlign: "center" as const,
    backgroundColor: "#f9f9f9",
  },
  input: {
    marginTop: "10px",
  },
  button: {
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#0051a2",
    color: "#fff",
  },
  error: {
    color: "red",
    fontSize: "14px",
  },
};
