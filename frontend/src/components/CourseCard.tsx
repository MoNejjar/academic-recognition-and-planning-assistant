import { useState } from "react";
import { Course, Catalogue } from "../types";

type Props = {
  course: Course;
  onUpdate: (updatedCourse: Course) => void;
  onDelete: () => void;
  onParseCatalogues: () => void;
  isLoadingCatalogues: boolean;
};

export default function CourseCard({
  course,
  onUpdate,
  onDelete,
  onParseCatalogues,
  isLoadingCatalogues,
}: Props) {
  const [showInitialData, setShowInitialData] = useState(false);

  const updateCourse = (updates: Partial<Course>) => {
    onUpdate({ ...course, ...updates });
  };

  const addPdfCatalogue = (file: File) => {
    const catalogue: Catalogue = {
      id: crypto.randomUUID(),
      name: file.name,
      type: "pdf",
      file,
    };
    updateCourse({ catalogues: [...course.catalogues, catalogue] });
  };

  const addManualCatalogue = () => {
    const text = prompt("Enter manual catalogue text:");
    if (!text?.trim()) return;
    const catalogue: Catalogue = {
      id: crypto.randomUUID(),
      name: "Manual catalogue",
      type: "manual",
      manualText: text,
    };
    updateCourse({ catalogues: [...course.catalogues, catalogue] });
  };

  const deleteCatalogue = (catalogueId: string) => {
    updateCourse({
      catalogues: course.catalogues.filter((cat) => cat.id !== catalogueId),
    });
  };

  const updateCatalogue = (catalogueId: string, updates: Partial<Catalogue>) => {
    updateCourse({
      catalogues: course.catalogues.map((cat) =>
        cat.id === catalogueId ? { ...cat, ...updates } : cat
      ),
    });
  };

  const clearCatalogueParsing = (catalogueId: string) => {
    updateCatalogue(catalogueId, { parsedLLM: undefined });
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* En-tête du cours */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <div style={{ flex: 1, marginRight: 12 }}>
          <input
            value={course.title}
            onChange={(e) => updateCourse({ title: e.target.value })}
            style={{
              width: "100%",
              fontWeight: "bold",
              fontSize: 18,
              border: "1px solid #ddd",
              padding: 8,
              borderRadius: 4,
              marginBottom: 8,
            }}
            placeholder="Titre du cours"
          />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={course.sourceUniversity}
              onChange={(e) => updateCourse({ sourceUniversity: e.target.value })}
              style={{
                flex: 1,
                border: "1px solid #ddd",
                padding: 6,
                borderRadius: 4,
                fontSize: 14,
              }}
              placeholder="Université source"
            />
            <input
              value={course.credits || ""}
              onChange={(e) => updateCourse({ credits: e.target.value })}
              style={{
                width: 100,
                border: "1px solid #ddd",
                padding: 6,
                borderRadius: 4,
                fontSize: 14,
              }}
              placeholder="ECTS"
            />
          </div>
        </div>
        <button
          onClick={onDelete}
          style={{
            padding: "6px 12px",
            background: "#f44336",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          🗑️ Supprimer
        </button>
      </div>

      {/* Données initiales parsées */}
      {course.initialParsedData && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setShowInitialData(!showInitialData)}
            style={{
              background: "none",
              border: "none",
              color: "#2196F3",
              cursor: "pointer",
              fontSize: 14,
              padding: 0,
              textDecoration: "underline",
            }}
          >
            {showInitialData ? "▼" : "▶"} Données parsées du fichier TUM
          </button>
          {showInitialData && (
            <div
              style={{
                background: "#f5f5f5",
                padding: 12,
                borderRadius: 4,
                marginTop: 8,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>ECTS:</strong>{" "}
                {course.initialParsedData.ects || "Not specified"}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>Language:</strong>{" "}
                {course.initialParsedData.language || "Not specified"}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>Module:</strong>{" "}
                {course.initialParsedData.module_number || "Not specified"}
              </div>
              {course.initialParsedData.content && (
                <div style={{ marginBottom: 8 }}>
                  <strong style={{ fontSize: 13 }}>Content:</strong>
                  <div style={{ 
                    fontSize: 12, 
                    color: "#555", 
                    maxHeight: 100, 
                    overflow: "auto",
                    background: "#fff",
                    padding: 8,
                    borderRadius: 4,
                    marginTop: 4
                  }}>
                    {course.initialParsedData.content}
                  </div>
                </div>
              )}
              <details style={{ fontSize: 12, marginTop: 8 }}>
                <summary style={{ cursor: "pointer", color: "#666" }}>
                  View all raw data
                </summary>
                <pre
                  style={{
                    background: "#fff",
                    padding: 8,
                    borderRadius: 4,
                    overflow: "auto",
                    marginTop: 8,
                    fontSize: 11,
                  }}
                >
                  {JSON.stringify(course.initialParsedData, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Catalogues section */}
      <div
        style={{
          marginTop: 16,
          borderTop: "1px solid #eee",
          paddingTop: 16,
        }}
      >
        <h3 style={{ fontSize: 16, marginBottom: 12, color: "#333" }}>
          📚 Course catalogues ({course.catalogues.length})
        </h3>

        {course.catalogues.map((cat) => (
          <div
            key={cat.id}
            style={{
              border: "1px solid #e0e0e0",
              padding: 12,
              marginBottom: 8,
              borderRadius: 4,
              background: "#fafafa",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <strong style={{ fontSize: 14 }}>{cat.name}</strong>
                <span
                  style={{
                    marginLeft: 8,
                    padding: "2px 6px",
                    background: cat.type === "pdf" ? "#2196F3" : "#9C27B0",
                    color: "#fff",
                    borderRadius: 3,
                    fontSize: 11,
                  }}
                >
                  {cat.type === "pdf" ? "📄 PDF" : "✏️ Manuel"}
                </span>
              </div>
              <button
                onClick={() => deleteCatalogue(cat.id)}
                style={{
                  padding: "4px 8px",
                  background: "#f44336",
                  color: "#fff",
                  border: "none",
                  borderRadius: 3,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Delete
              </button>
            </div>

            {cat.manualText && (
              <div
                style={{
                  background: "#fff",
                  padding: 8,
                  borderRadius: 4,
                  fontSize: 13,
                  color: "#555",
                  marginBottom: 8,
                }}
              >
                {cat.manualText}
              </div>
            )}

            {cat.parsedLLM && (
              <div style={{ marginTop: 8 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <strong style={{ fontSize: 13, color: "#4CAF50" }}>
                    ✓ Résultat du parsing
                  </strong>
                  <button
                    onClick={() => clearCatalogueParsing(cat.id)}
                    style={{
                      padding: "3px 8px",
                      background: "#ff9800",
                      color: "#fff",
                      border: "none",
                      borderRadius: 3,
                      cursor: "pointer",
                      fontSize: 11,
                    }}
                  >
                    Effacer
                  </button>
                </div>
                <div
                  style={{
                    background: "#fff",
                    padding: 10,
                    borderRadius: 4,
                    border: "1px solid #4CAF50",
                  }}
                >
                  {cat.parsedLLM.summary && (
                    <div style={{ marginBottom: 6, fontSize: 13 }}>
                      <strong>Summary:</strong> {cat.parsedLLM.summary}
                    </div>
                  )}
                  {cat.parsedLLM.ects && (
                    <div style={{ marginBottom: 6, fontSize: 13 }}>
                      <strong>ECTS:</strong> {cat.parsedLLM.ects}
                    </div>
                  )}
                  {cat.parsedLLM.topics && cat.parsedLLM.topics.length > 0 && (
                    <div style={{ marginBottom: 6, fontSize: 13 }}>
                      <strong>Topics:</strong> {cat.parsedLLM.topics.join(", ")}
                    </div>
                  )}
                  {cat.parsedLLM.courses && cat.parsedLLM.courses.length > 0 && (
                    <div style={{ marginBottom: 6, fontSize: 13 }}>
                      <strong>Detected courses:</strong> {cat.parsedLLM.courses.length}
                      <details style={{ marginTop: 4, fontSize: 12 }}>
                        <summary style={{ cursor: "pointer", color: "#666" }}>
                          View courses
                        </summary>
                        <div style={{ marginTop: 4, paddingLeft: 8 }}>
                          {cat.parsedLLM.courses.map((c: any, idx: number) => (
                            <div key={idx} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: "1px solid #eee" }}>
                              <div><strong>{c.module_name}</strong></div>
                              {c.module_number && <div style={{ fontSize: 11, color: "#666" }}>Module: {c.module_number}</div>}
                              {c.ects && <div style={{ fontSize: 11, color: "#666" }}>ECTS: {c.ects}</div>}
                              {c.language && <div style={{ fontSize: 11, color: "#666" }}>Language: {c.language}</div>}
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  )}
                  {cat.parsedLLM.error && (
                    <div style={{ color: "#f44336", fontSize: 13, marginBottom: 6 }}>
                      <strong>⚠️ Error:</strong> {cat.parsedLLM.error}
                    </div>
                  )}
                  <details style={{ marginTop: 8, fontSize: 12 }}>
                    <summary style={{ cursor: "pointer", color: "#666" }}>
                      Edit data (JSON)
                    </summary>
                    <textarea
                      value={JSON.stringify(cat.parsedLLM, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          updateCatalogue(cat.id, { parsedLLM: parsed });
                        } catch {
                          // Invalid JSON, ignore
                        }
                      }}
                      style={{
                        width: "100%",
                        height: 100,
                        fontFamily: "monospace",
                        fontSize: 11,
                        padding: 6,
                        borderRadius: 4,
                        border: "1px solid #ddd",
                        marginTop: 8,
                      }}
                    />
                  </details>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Actions to add catalogues */}
        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <label
            style={{
              padding: "8px 14px",
              background: "#2196F3",
              color: "#fff",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
              display: "inline-block",
            }}
          >
            📄 Add PDF
            <input
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) addPdfCatalogue(file);
                e.target.value = "";
              }}
            />
          </label>

          <button
            onClick={addManualCatalogue}
            style={{
              padding: "8px 14px",
              background: "#9C27B0",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ✏️ Add manually
          </button>

          {course.catalogues.some((c) => c.file && !c.parsedLLM) && (
            <button
              onClick={onParseCatalogues}
              disabled={isLoadingCatalogues}
              style={{
                padding: "8px 14px",
                background: isLoadingCatalogues ? "#ccc" : "#4CAF50",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: isLoadingCatalogues ? "not-allowed" : "pointer",
                fontSize: 14,
              }}
            >
              {isLoadingCatalogues ? "⏳ Parsing..." : "🔍 Parse PDFs"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}