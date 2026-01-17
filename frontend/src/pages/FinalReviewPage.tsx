import { useState } from "react";
import { MappingRow } from "../types";
import { useNavigate } from "react-router-dom";

type Props = {
    mappingFile: File | null;
    mappingRows: MappingRow[];
    onSubmit: () => void;
};

export default function FinalReviewPage({ mappingFile, mappingRows, onSubmit }: Props) {
    const navigate = useNavigate();
    const [expandedContent, setExpandedContent] = useState<string | null>(null);
    const [expandedCourse, setExpandedCourse] = useState<string>("");

    const handleSubmit = () => {
        if (mappingRows.length === 0) {
            alert("No mappings to submit.");
            return;
        }
        onSubmit();
    };

    const handleViewContent = (courseNo: string, content: string) => {
        setExpandedCourse(courseNo);
        setExpandedContent(content);
    };

    return (
        <div style={styles.container}>
            {/* Content Modal */}
            {expandedContent && (
                <div style={styles.modalOverlay} onClick={() => setExpandedContent(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0 }}>📖 Content for {expandedCourse}</h3>
                            <button onClick={() => setExpandedContent(null)} style={styles.closeBtn}>✕</button>
                        </div>
                        <div style={styles.modalContent}>
                            {expandedContent}
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.header}>
                <h1 style={styles.title}>Final Review</h1>
                <p style={styles.subtitle}>Review all your course mappings before submitting</p>
            </div>

            {mappingFile && (
                <div style={styles.fileInfo}>
                    📄 Source file: <strong>{mappingFile.name}</strong>
                </div>
            )}


            {mappingRows.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                    <p>No mappings to display.</p>
                    <button onClick={() => navigate("/")} style={styles.secondaryBtn}>← Start Over</button>
                </div>
            ) : (
                <div style={styles.card}>
                    <div style={{ overflowX: "auto" }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Source Course</th>
                                    <th style={styles.th}>Credits</th>
                                    <th style={styles.th}>Grade</th>
                                    <th style={styles.th}></th>
                                    <th style={styles.th}>TUM Module</th>
                                    <th style={styles.th}>ECTS</th>
                                    <th style={styles.th}>Content</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mappingRows.map((row) => (
                                    <tr key={row.id}>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>{row.source_course_no}</span>
                                            <div style={{ marginTop: 4, color: "#6b7280", fontSize: 13 }}>{row.source_course_name}</div>
                                        </td>
                                        <td style={styles.td}>{row.source_credits}</td>
                                        <td style={styles.td}>{row.source_grade}</td>
                                        <td style={{ ...styles.td, textAlign: "center", color: "#9ca3af" }}>→</td>
                                        <td style={styles.td}>
                                            <span style={{ ...styles.badge, background: "#dbeafe", color: "#1d4ed8" }}>{row.tum_module_nr}</span>
                                            <div style={{ marginTop: 4, color: "#6b7280", fontSize: 13 }}>{row.tum_module_title}</div>
                                        </td>
                                        <td style={styles.td}>{row.tum_ects}</td>
                                        <td style={styles.td}>
                                            {row.catalogue_content ? (
                                                <button
                                                    onClick={() => handleViewContent(row.source_course_no, row.catalogue_content || "")}
                                                    style={styles.viewBtn}
                                                >
                                                    📖 View
                                                </button>
                                            ) : (
                                                <span style={{ color: "#9ca3af" }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div style={styles.actions}>
                <button onClick={() => navigate("/catalogue")} style={styles.secondaryBtn}>← Back</button>
                <button onClick={() => navigate("/")} style={styles.secondaryBtn}>🔄 Start Over</button>
                <button onClick={handleSubmit} style={styles.submitBtn}>
                    📤 Submit to TUM Staff
                </button>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: 40, maxWidth: 1200, margin: "0 auto", fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: 32 },
    title: { fontSize: 32, fontWeight: 700, color: "#111827", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#6b7280" },
    fileInfo: { padding: 12, background: "#f3f4f6", borderRadius: 8, marginBottom: 24, color: "#374151", fontSize: 14 },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 32 },
    statCard: { padding: 24, background: "#fff", borderRadius: 12, textAlign: "center" as const, boxShadow: "0 1px 3px rgb(0 0 0 / 0.1)", border: "1px solid #e5e7eb" },
    statValue: { fontSize: 36, fontWeight: 700, color: "#3b82f6" },
    statLabel: { fontSize: 14, color: "#6b7280", marginTop: 4 },
    card: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", border: "1px solid #e5e7eb", marginBottom: 24 },
    emptyState: { textAlign: "center" as const, padding: 64, background: "#f9fafb", borderRadius: 12, color: "#6b7280" },
    table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 14 },
    th: { padding: "14px 12px", textAlign: "left" as const, borderBottom: "2px solid #e5e7eb", fontWeight: 600, color: "#374151", background: "#f9fafb" },
    td: { padding: "14px 12px", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" as const },
    badge: { display: "inline-block", padding: "4px 10px", background: "#e0e7ff", color: "#4338ca", borderRadius: 6, fontSize: 13, fontWeight: 500 },
    actions: { display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" as const },
    secondaryBtn: { padding: "12px 24px", background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 500 },
    submitBtn: { padding: "14px 32px", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16, fontWeight: 600, boxShadow: "0 4px 6px -1px rgb(34 197 94 / 0.4)" },
    viewBtn: { padding: "6px 12px", background: "#dbeafe", color: "#1d4ed8", border: "1px solid #93c5fd", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500 },
    modalOverlay: { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modal: { background: "#fff", borderRadius: 16, padding: 32, maxWidth: 900, width: "95%", maxHeight: "85vh", overflowY: "auto" as const, overflowX: "hidden" as const, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" },
    modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" },
    modalContent: { fontSize: 14, lineHeight: 1.6, color: "#374151", whiteSpace: "pre-wrap" as const, overflowWrap: "anywhere" as const, wordBreak: "break-word" as const },
    closeBtn: { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 14 },
};
