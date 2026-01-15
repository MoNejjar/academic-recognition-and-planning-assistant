import { useState } from "react";
import { Course } from "../types";
import { parseCatalogue } from "../api/courses";
import CourseCard from "../components/CourseCard";

type Props = {
  tumFile: File | null;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  onSubmit: () => void;
};

export default function ReviewPage({ tumFile, courses, setCourses, onSubmit }: Props) {
  const [loadingCatalogueForCourse, setLoadingCatalogueForCourse] = useState<string | null>(null);

  // Add a new course manually
  const addManualCourse = () => {
    const newCourse: Course = {
      id: crypto.randomUUID(),
      title: "New course",
      sourceUniversity: "",
      catalogues: [],
    };
    setCourses((prev) => [...prev, newCourse]);
  };

  // Update a course
  const updateCourse = (courseId: string, updatedCourse: Course) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? updatedCourse : c))
    );
  };

  // Delete a course
  const deleteCourse = (courseId: string) => {
    if (confirm("Delete this course?")) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
  };

  // Parse catalogues for a course
  const handleParseCatalogues = async (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const cataloguesToParse = course.catalogues.filter((c) => c.file !== undefined);
    if (cataloguesToParse.length === 0) {
      alert("No PDF catalogue to parse for this course.");
      return;
    }

    setLoadingCatalogueForCourse(courseId);

    try {
      const parsed = await parseCatalogue(cataloguesToParse);

      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId
            ? {
                ...c,
                catalogues: c.catalogues.map((cat) => {
                  const index = cataloguesToParse.findIndex((ct) => ct.id === cat.id);
                  if (index !== -1 && parsed[index]) {
                    return { ...cat, parsedLLM: parsed[index] };
                  }
                  return cat;
                }),
              }
            : c
        )
      );
    } catch (err) {
      console.error("Error parsing catalogues:", err);
      alert("Error during parsing. Please try again.");
    } finally {
      setLoadingCatalogueForCourse(null);
    }
  };

  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ margin: 0, marginBottom: 8 }}>Course Review</h1>
          {tumFile && (
            <p style={{ margin: 0, color: "#666", fontSize: 14 }}>
              📄 TUM File: <strong>{tumFile.name}</strong>
            </p>
          )}
          {!tumFile && courses.length === 0 && (
            <p style={{ margin: 0, color: "#999", fontSize: 14 }}>
              No TUM file uploaded. Add courses manually.
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={addManualCourse}
            style={{
              padding: "10px 16px",
              background: "#2196F3",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            ➕ Add a course
          </button>
          <button
            onClick={onSubmit}
            disabled={courses.length === 0}
            style={{
              padding: "10px 16px",
              background: courses.length > 0 ? "#4CAF50" : "#ccc",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: courses.length > 0 ? "pointer" : "not-allowed",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            📤 Send to TUM staff
          </button>
        </div>
      </div>

      {/* Message if no courses */}
      {courses.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: 64,
            color: "#999",
            background: "#f9f9f9",
            borderRadius: 8,
            border: "2px dashed #ddd",
          }}
        >
          <p style={{ fontSize: 16, marginBottom: 16 }}>
            No courses to display.
          </p>
          <button
            onClick={addManualCourse}
            style={{
              padding: "10px 20px",
              background: "#2196F3",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Add your first course
          </button>
        </div>
      )}

      {/* Course list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onUpdate={(updatedCourse : Course) => updateCourse(course.id, updatedCourse)}
            onDelete={() => deleteCourse(course.id)}
            onParseCatalogues={() => handleParseCatalogues(course.id)}
            isLoadingCatalogues={loadingCatalogueForCourse === course.id}
          />
        ))}
      </div>
    </div>
  );
}