import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractCatalogueContent } from "../api/courses";
import { MappingRow, CourseContent } from "../types";

type Props = {
    mappingRows: MappingRow[];
    onContentConfirmed: (updatedRows: MappingRow[]) => void;
};

export default function CatalogueUploadPage({ mappingRows, onContentConfirmed }: Props) {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [matchedRows, setMatchedRows] = useState<MappingRow[]>([]);
    const [showReview, setShowReview] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [editedRows, setEditedRows] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    // Match extracted courses to mapping rows
    const matchCourses = (extracted: CourseContent[], rows: MappingRow[]): MappingRow[] => {
        return rows.map((row) => {
            const match = extracted.find((course) => {
                const numberMatch = course.module_number?.toLowerCase().includes(row.source_course_no.toLowerCase()) ||
                    row.source_course_no.toLowerCase().includes(course.module_number?.toLowerCase() || "");
                const nameMatch = course.module_name?.toLowerCase().includes(row.source_course_name.toLowerCase()) ||
                    row.source_course_name.toLowerCase().includes(course.module_name?.toLowerCase() || "");
                return numberMatch || nameMatch;
            });
            return { ...row, catalogue_content: match?.module_content || "" };
        });
    };

    // Handle bulk file upload
    const handleFilesUpload = (newFiles: FileList | null) => {
        if (newFiles) {
            setFiles([...files, ...Array.from(newFiles)]);
            setError(null);
        }
    };

    // Remove a file
    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    // Extract content from all uploaded PDFs
    const handleExtract = async () => {
        if (files.length === 0) {
            // Manual entry mode
            setMatchedRows(mappingRows.map(row => ({ ...row, catalogue_content: "" })));
            setShowReview(true);
            return;
        }

        setLoading(true);
        setError(null);
        const allExtracted: CourseContent[] = [];

        try {
            for (const file of files) {
                const result = await extractCatalogueContent(file);
                if (result.courses) {
                    allExtracted.push(...result.courses);
                }
            }


            const matched = matchCourses(allExtracted, mappingRows);
            setMatchedRows(matched);
            setShowReview(true);
        } catch (err: any) {
            setError(err.message || "Extraction failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleContentChange = (id: string, content: string) => {
        setMatchedRows((prev) => prev.map((row) => (row.id === id ? { ...row, catalogue_content: content } : row)));
        setEditedRows((prev) => new Set(prev).add(id));
    };

    const handleConfirm = () => {
        const emptyContent = matchedRows.filter((row) => !row.catalogue_content || row.catalogue_content.trim() === "");
        if (emptyContent.length > 0) {
            alert(`Please fill in content for all courses. ${emptyContent.length} course(s) are missing content.`);
            return;
        }
        onContentConfirmed(matchedRows);
        navigate("/review");
    };



    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesUpload(e.dataTransfer.files);
        }
    };

    // Review View
    if (showReview) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Review Extracted Content</h1>
                    <p style={styles.subtitle}>Review and edit the matched course content. You can modify any field.</p>
                </div>

                {/* Warning about auto-match accuracy */}
                <div style={styles.warningBox}>
                    <strong>⚠️ Important:</strong> Auto-matching is not 100% accurate. Please verify that each course content matches the correct course. You can edit any field below.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {matchedRows.map((row) => (
                        <div key={row.id} style={{ ...styles.card, borderLeft: row.catalogue_content ? "4px solid #22c55e" : "4px solid #f59e0b" }}>
                            <div style={styles.courseHeader}>
                                <div>
                                    <span style={styles.badge}>{row.source_course_no}</span>
                                    <span style={{ ...styles.matchingBadge, marginLeft: 8 }}>{row.matching_type}</span>
                                    <strong style={{ marginLeft: 8 }}>{row.source_course_name}</strong>
                                </div>
                                <div style={styles.arrow}>→ {row.tum_module_nr} ({row.tum_ects} ECTS)</div>
                            </div>

                            <div style={{ marginTop: 12 }}>
                                <label style={styles.label}>
                                    {row.catalogue_content && !editedRows.has(row.id)
                                        ? "✅ Extracted Content (editable)"
                                        : row.catalogue_content
                                            ? "📝 Content"
                                            : "⚠️ No match found - enter manually"}
                                </label>
                                <textarea
                                    value={row.catalogue_content}
                                    onChange={(e) => handleContentChange(row.id, e.target.value)}
                                    placeholder="Enter course description, learning outcomes, topics covered..."
                                    style={{
                                        ...styles.textarea,
                                        borderColor: row.catalogue_content ? "#d1d5db" : "#fbbf24",
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={styles.actions}>
                    <button onClick={() => setShowReview(false)} style={styles.secondaryBtn}>← Back</button>
                    <button onClick={handleConfirm} style={styles.primaryBtn}>Confirm & Continue →</button>
                </div>
            </div>
        );
    }

    // Upload View
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Upload Course Catalogues</h1>
                <p style={styles.subtitle}>Upload PDFs containing your course descriptions from your previous university</p>
            </div>

            <div style={styles.card}>
                {/* Confirmed courses summary */}
                <div style={styles.infoBox}>
                    <strong>📚 Courses to Find ({mappingRows.length})</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                        {mappingRows.map((row) => (
                            <span key={row.id} style={styles.badge}>
                                {row.source_course_no}
                                <span style={{ marginLeft: 4, opacity: 0.7, fontSize: 11 }}>({row.matching_type})</span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Instructions */}
                <div style={styles.instructionBox}>
                    <div style={styles.instructionTitle}>📁 Upload your course catalogue PDFs</div>
                    <div style={styles.instructionList}>
                        <div style={styles.instructionItem}>
                            <span style={styles.bulletBlue}>•</span>
                            <strong>One PDF for all courses</strong> - a complete catalogue containing multiple courses
                        </div>
                        <div style={styles.instructionItem}>
                            <span style={styles.bulletPurple}>•</span>
                            <strong>Separate PDFs per course</strong> - individual syllabi for each course
                        </div>
                        <div style={styles.instructionItem}>
                            <span style={styles.bulletGreen}>•</span>
                            <strong>Any combination</strong> - upload as many PDFs as needed, we'll auto-match
                        </div>
                    </div>
                </div>

                {/* Drop Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{
                        ...styles.dropZone,
                        borderColor: dragActive ? "#8b5cf6" : files.length > 0 ? "#22c55e" : "#d1d5db",
                        background: dragActive ? "#faf5ff" : files.length > 0 ? "#f0fdf4" : "#fafafa",
                    }}
                >
                    <input
                        type="file"
                        accept="application/pdf"
                        multiple
                        onChange={(e) => handleFilesUpload(e.target.files)}
                        style={{ display: "none" }}
                        id="catalogue-upload"
                    />
                    <label htmlFor="catalogue-upload" style={{ cursor: "pointer", textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                        <p style={{ fontWeight: 500, color: "#374151" }}>
                            Drop PDFs here or <span style={{ color: "#8b5cf6", textDecoration: "underline" }}>browse</span>
                        </p>
                        <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 8 }}>
                            Upload one or multiple PDF files • We'll auto-match courses
                        </p>
                    </label>
                </div>

                {/* Uploaded Files List */}
                {files.length > 0 && (
                    <div style={styles.filesList}>
                        <div style={styles.filesHeader}>
                            <strong>📎 Uploaded Files ({files.length})</strong>
                            <button
                                onClick={() => setFiles([])}
                                style={styles.clearBtn}
                            >
                                Clear all
                            </button>
                        </div>
                        {files.map((f, idx) => (
                            <div key={idx} style={styles.fileItem}>
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 20 }}>📄</span>
                                    <span>{f.name}</span>
                                    <span style={{ color: "#9ca3af", fontSize: 12 }}>
                                        ({(f.size / 1024).toFixed(0)} KB)
                                    </span>
                                </span>
                                <button onClick={() => removeFile(idx)} style={styles.removeBtn}>✕</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Loading Overlay */}
                {loading && (
                    <div style={styles.loadingOverlay}>
                        <div style={styles.loadingSpinner}>🔄</div>
                        <div style={styles.loadingTitle}>Extracting content from PDFs...</div>
                        <div style={styles.loadingText}>This may take some time depending on the file size.</div>
                        <div style={styles.loadingText}>Please wait, don't close this page.</div>
                    </div>
                )}

                {error && <div style={styles.error}>{error}</div>}

                <div style={styles.actions}>
                    <button
                        onClick={handleExtract}
                        disabled={loading}
                        style={{ ...styles.primaryBtn, opacity: loading ? 0.5 : 1 }}
                    >
                        {loading ? (
                            <>🔄 Extracting...</>
                        ) : files.length > 0 ? (
                            <>🔍 Extract & Match Courses</>
                        ) : (
                            <>✏️ Enter Content Manually</>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: 40, maxWidth: 1000, margin: "0 auto", fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: 32, textAlign: "center" as const },
    title: { fontSize: 32, fontWeight: 700, color: "#111827", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#6b7280" },
    card: { background: "#fff", borderRadius: 16, padding: 32, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", border: "1px solid #e5e7eb", marginBottom: 24 },
    statsCard: { display: "flex", gap: 24, padding: 24, background: "#f9fafb", borderRadius: 12, marginBottom: 24 },
    stat: { textAlign: "center" as const, flex: 1 },
    statValue: { fontSize: 32, fontWeight: 700, color: "#3b82f6" },
    statLabel: { fontSize: 14, color: "#6b7280", marginTop: 4 },
    infoBox: { padding: 20, background: "#f0f9ff", borderRadius: 12, marginBottom: 24, border: "1px solid #bae6fd" },
    instructionBox: { padding: 20, background: "#fefce8", borderRadius: 12, marginBottom: 24, border: "1px solid #fef08a" },
    instructionTitle: { fontWeight: 600, fontSize: 16, color: "#854d0e", marginBottom: 12 },
    instructionList: { display: "flex", flexDirection: "column" as const, gap: 8 },
    instructionItem: { display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: "#374151" },
    bulletBlue: { color: "#3b82f6", fontSize: 18, lineHeight: 1 },
    bulletPurple: { color: "#8b5cf6", fontSize: 18, lineHeight: 1 },
    bulletGreen: { color: "#22c55e", fontSize: 18, lineHeight: 1 },
    badge: { display: "inline-block", padding: "4px 12px", background: "#e0e7ff", color: "#4338ca", borderRadius: 20, fontSize: 13, fontWeight: 500 },
    matchingBadge: { display: "inline-block", padding: "2px 8px", background: "#fef3c7", color: "#92400e", borderRadius: 12, fontSize: 11, fontWeight: 600 },
    dropZone: { border: "2px dashed #d1d5db", borderRadius: 12, padding: "48px 32px", textAlign: "center" as const, transition: "all 0.2s", marginBottom: 24 },
    filesList: { background: "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 24 },
    filesHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, color: "#374151" },
    clearBtn: { background: "transparent", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 13 },
    fileItem: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#fff", borderRadius: 8, marginBottom: 8, border: "1px solid #e5e7eb" },
    removeBtn: { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", fontSize: 12 },
    actions: { display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" as const },
    primaryBtn: { padding: "12px 24px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600, boxShadow: "0 4px 6px -1px rgb(139 92 246 / 0.4)" },
    secondaryBtn: { padding: "12px 24px", background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 500 },
    error: { padding: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", marginBottom: 16 },
    courseHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 12 },
    arrow: { color: "#6b7280", fontSize: 14 },
    label: { display: "block", fontSize: 14, color: "#6b7280", marginBottom: 8 },
    textarea: { width: "100%", minHeight: 100, padding: 12, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, resize: "vertical" as const, outline: "none" },
    loadingOverlay: { padding: 32, background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)", borderRadius: 16, textAlign: "center" as const, marginBottom: 24, border: "1px solid #bae6fd" },
    loadingSpinner: { fontSize: 48, marginBottom: 16, animation: "spin 1s linear infinite" },
    loadingTitle: { fontSize: 18, fontWeight: 600, color: "#1e40af", marginBottom: 8 },
    loadingText: { fontSize: 14, color: "#6b7280", marginTop: 4 },
    warningBox: { padding: 16, background: "#fef3c7", borderRadius: 12, marginBottom: 32, border: "1px solid #fcd34d", color: "#92400e", fontSize: 14 },
};
