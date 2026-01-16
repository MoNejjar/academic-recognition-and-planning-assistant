import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseCourses } from "../api/courses";
import { Course } from "../types";

type Props = {
  onCoursesLoaded: (tumFile: File, courses: Course[]) => void;
};

export default function HomePage({ onCoursesLoaded }: Props) {
  const [tumFile, setTumFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = async () => {
    if (!tumFile) return;

    setLoading(true);
    setError(null);

    try {
      const parsedData = await parseCourses(tumFile);
      
      // Check if we received data
      if (!Array.isArray(parsedData) || parsedData.length === 0) {
        setError("No courses detected in the file.");
        return;
      }
      
      // Convert parsed data to Course objects
      const courses: Course[] = parsedData.map((item: any) => ({
        id: item.id || crypto.randomUUID(),
        university: {
          moduleNumber: item.university_module_number || item.parsedLLM?.module_number,
          title: item.university_title || item.title || "Untitled",
          creditPoints: item.university_credit_points || item.parsedLLM?.ects,
          originalGrade: item.university_grade,
        },
        tum: {
          moduleNumber: item.tum_module_number,
          title: item.tum_title || "",
          ects: item.tum_ects || item.parsedLLM?.ects,
        },
        initialParsedData: item.parsedLLM || item,
        catalogues: [],
      }));

      onCoursesLoaded(tumFile, courses);
      navigate("/review");
    } catch (err: any) {
      console.error("Error during parsing:", err);
      const errorMessage = err.response?.data?.detail || err.message || "Unable to parse file.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAndManual = () => {
    // User wants to enter everything manually
    onCoursesLoaded(null as any, []);
    navigate("/review");
  };

  return (
    <div style={{ padding: 32, maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>TUM Credit Recognition</h1>
      <p>Upload your official TUM file containing the courses to be recognized.</p>

      <div style={{ marginTop: 24, marginBottom: 16 }}>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            setTumFile(e.target.files?.[0] || null);
            setError(null);
          }}
          style={{ display: "block", marginBottom: 16 }}
        />
        
        {tumFile && (
          <p style={{ color: "#666", fontSize: 14 }}>
            📄 Selected file: <strong>{tumFile.name}</strong>
          </p>
        )}
      </div>

      {error && (
        <div style={{ padding: 12, background: "#fee", border: "1px solid #f88", borderRadius: 4, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <button
        onClick={handleFileUpload}
        disabled={!tumFile || loading}
        style={{
          padding: "12px 24px",
          background: tumFile && !loading ? "#4CAF50" : "#ccc",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: tumFile && !loading ? "pointer" : "not-allowed",
          fontSize: 16,
          marginRight: 8,
        }}
      >
        {loading ? "⏳ Parsing in progress... (this may take up to 3 minutes)" : "Parse file"}
      </button>

      <button
        onClick={handleSkipAndManual}
        disabled={loading}
        style={{
          padding: "12px 24px",
          background: "#fff",
          color: "#333",
          border: "1px solid #ccc",
          borderRadius: 4,
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        Enter manually
      </button>
    </div>
  );
}