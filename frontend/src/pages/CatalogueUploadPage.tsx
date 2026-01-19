import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { extractCatalogueContent } from "../api/courses";
import { TUMModuleMapping, CourseContent } from "../types";

type Props = {
    tumModules: TUMModuleMapping[];
    onContentConfirmed: (updatedModules: TUMModuleMapping[]) => void;
};

export default function CatalogueUploadPage({ tumModules, onContentConfirmed }: Props) {
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatedModules, setUpdatedModules] = useState<TUMModuleMapping[]>([]);
    const [showReview, setShowReview] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [editedModules, setEditedModules] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    // Match extracted courses to source courses in modules
    const matchCourses = (extracted: CourseContent[], modules: TUMModuleMapping[]): TUMModuleMapping[] => {
        return modules.map((mod) => {
            // Try to match catalogue content based on source course numbers/names
            let matchedContent = "";

            for (const sc of mod.source_courses) {
                const match = extracted.find((course) => {
                    const numberMatch = course.module_number?.toLowerCase().includes(sc.source_course_no.toLowerCase()) ||
                        sc.source_course_no.toLowerCase().includes(course.module_number?.toLowerCase() || "");
                    const nameMatch = course.module_name?.toLowerCase().includes(sc.source_course_name.toLowerCase()) ||
                        sc.source_course_name.toLowerCase().includes(course.module_name?.toLowerCase() || "");
                    return numberMatch || nameMatch;
                });

                if (match) {
                    if (matchedContent) matchedContent += "\n\n---\n\n";
                    matchedContent += `[${match.module_number}] ${match.module_name}\n${match.module_content}`;
                }
            }

            return {
                ...mod,
                catalogue_content: matchedContent || mod.catalogue_content,
            };
        });
    };

    const handleFilesUpload = async (fileList: FileList) => {
        const newFiles = Array.from(fileList).filter((f) => f.type === "application/pdf");
        if (newFiles.length === 0) {
            setError("Please upload PDF files.");
            return;
        }
        setFiles(newFiles);
        setError(null);
    };

    const handleExtract = async () => {
        if (files.length === 0) return;
        setLoading(true);
        setError(null);

        try {
            const allExtracted: CourseContent[] = [];

            for (const file of files) {
                const result = await extractCatalogueContent(file);
                if (result.courses) {
                    allExtracted.push(...result.courses);
                }
            }

            const matched = matchCourses(allExtracted, tumModules);
            setUpdatedModules(matched);
            setShowReview(true);
        } catch (err: any) {
            setError(err.message || "Extraction failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleContentChange = (moduleId: string, content: string) => {
        setUpdatedModules((prev) =>
            prev.map((mod) => (mod.id === moduleId ? { ...mod, catalogue_content: content } : mod))
        );
        setEditedModules((prev) => new Set(prev).add(moduleId));
    };

    const handleConfirm = () => {
        const emptyContent = updatedModules.filter((mod) => !mod.catalogue_content.trim());
        if (emptyContent.length > 0) {
            alert(`Please fill in content for all TUM modules. ${emptyContent.length} module(s) are missing content.`);
            return;
        }
        onContentConfirmed(updatedModules);
        navigate("/review");
    };

    const handleSkipToManual = () => {
        setUpdatedModules(tumModules.map((mod) => ({ ...mod, catalogue_content: mod.catalogue_content || "" })));
        setShowReview(true);
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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFilesUpload(e.target.files);
        }
    };

    // Review View
    if (showReview) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Review Extracted Content</h1>
                    <p style={styles.subtitle}>Review and edit the catalogue content for each TUM module.</p>
                </div>

                <div style={styles.warningBox}>
                    <strong>⚠️ Important:</strong> Auto-matching is not 100% accurate. Please verify that each content matches the correct TUM module.
                </div>

                <div style={styles.modulesList}>
                    {updatedModules.map((mod) => (
                        <div key={mod.id} style={styles.moduleCard}>
                            <div style={styles.moduleHeader}>
                                <div style={styles.tumBadge}>TUM</div>
                                <div>
                                    <div style={styles.moduleNr}>{mod.tum_module_nr}</div>
                                    <div style={styles.moduleTitle}>{mod.tum_module_title}</div>
                                </div>
                                <div style={styles.sourceCount}>
                                    {mod.source_courses.length} source course{mod.source_courses.length !== 1 ? "s" : ""}
                                </div>
                            </div>

                            <div style={styles.sourceCoursesList}>
                                {mod.source_courses.map((sc) => (
                                    <div key={sc.id} style={styles.sourceTag}>
                                        {sc.source_course_no} - {sc.source_course_name}
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: 16 }}>
                                <label style={styles.label}>
                                    {mod.catalogue_content && !editedModules.has(mod.id)
                                        ? "✅ Extracted Content (editable)"
                                        : mod.catalogue_content
                                            ? "📝 Content"
                                            : "⚠️ No match found - enter manually"}
                                </label>
                                <textarea
                                    value={mod.catalogue_content}
                                    onChange={(e) => handleContentChange(mod.id, e.target.value)}
                                    placeholder="Enter course description, learning outcomes, topics..."
                                    style={{
                                        ...styles.textarea,
                                        borderColor: mod.catalogue_content ? "#d1d5db" : "#fbbf24",
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={styles.actions}>
                    <button onClick={() => { setShowReview(false); setFiles([]); }} style={styles.secondaryBtn}>
                        ← Upload Different Files
                    </button>
                    <button onClick={handleConfirm} style={styles.primaryBtn}>
                        Continue to Review →
                    </button>
                </div>
            </div>
        );
    }

    // Upload View
    return (
        <div style={styles.container}>

            <div style={styles.header}>
                <h1 style={styles.title}>Upload Course Catalogues</h1>
                <p style={styles.subtitle}>
                    Upload catalogue PDFs to auto-match content to your TUM modules.
                </p>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.statsRow}>
                <div style={styles.statBadge}>📚 {tumModules.length} TUM Modules to match</div>
            </div>

            <div
                style={{
                    ...styles.dropzone,
                    borderColor: dragActive ? "#8b5cf6" : files.length > 0 ? "#22c55e" : "#d1d5db",
                    background: dragActive ? "#f3e8ff" : files.length > 0 ? "#f0fdf4" : "#fafafa",
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{files.length > 0 ? "✅" : "📚"}</div>
                {files.length > 0 ? (
                    <>
                        <div style={styles.fileName}>{files.length} file(s) selected</div>
                        <div style={styles.fileList}>
                            {files.map((f, i) => <div key={i} style={styles.fileItem}>{f.name}</div>)}
                        </div>
                    </>
                ) : (
                    <>
                        <div style={styles.dropText}>Drag & drop catalogue PDFs here</div>
                        <div style={styles.dropSubtext}>or click to browse (multiple files supported)</div>
                    </>
                )}
                <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileSelect}
                    style={styles.fileInput}
                />
            </div>

            <div style={styles.actions}>
                <button onClick={() => navigate("/mapping")} style={styles.secondaryBtn}>
                    ← Back
                </button>
                <button onClick={handleSkipToManual} style={styles.secondaryBtn}>
                    Skip (Enter Manually)
                </button>
                <button
                    onClick={handleExtract}
                    disabled={files.length === 0 || loading}
                    style={{
                        ...styles.primaryBtn,
                        opacity: files.length === 0 || loading ? 0.5 : 1,
                    }}
                >
                    {loading ? "Extracting..." : "Extract & Match →"}
                </button>
            </div>

            {loading && (
                <div style={styles.loadingStatus}>
                    🔄 Extracting content from PDFs... This may take some time.
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: 40, maxWidth: 1000, margin: "0 auto", fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: 32, textAlign: "center" as const },
    title: { fontSize: 32, fontWeight: 700, color: "#111827", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#6b7280" },
    errorBox: { padding: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", marginBottom: 24 },
    warningBox: { padding: 16, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, color: "#92400e", marginBottom: 24, fontSize: 14 },

    statsRow: { display: "flex", gap: 16, justifyContent: "center", marginBottom: 24 },
    statBadge: { padding: "8px 16px", background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, fontSize: 14, fontWeight: 500 },

    modulesList: { display: "flex", flexDirection: "column" as const, gap: 20, marginBottom: 32 },
    moduleCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, boxShadow: "0 2px 4px rgb(0 0 0 / 0.05)" },
    moduleHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
    tumBadge: { padding: "6px 12px", background: "#3b82f6", color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600 },
    moduleNr: { fontSize: 15, fontWeight: 600, color: "#374151" },
    moduleTitle: { fontSize: 13, color: "#6b7280" },
    sourceCount: { marginLeft: "auto", fontSize: 12, color: "#9ca3af" },

    sourceCoursesList: { display: "flex", flexWrap: "wrap" as const, gap: 8 },
    sourceTag: { padding: "4px 10px", background: "#f3f4f6", borderRadius: 4, fontSize: 12, color: "#4b5563" },

    label: { display: "block", fontSize: 12, fontWeight: 500, color: "#6b7280", marginBottom: 6 },
    textarea: { width: "100%", minHeight: 120, padding: 12, border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, resize: "vertical" as const, boxSizing: "border-box" as const },

    actions: { display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap" as const },
    secondaryBtn: { padding: "12px 24px", background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 500 },
    primaryBtn: { padding: "14px 32px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16, fontWeight: 600, boxShadow: "0 4px 6px -1px rgb(139 92 246 / 0.4)" },

    dropzone: { border: "2px dashed #d1d5db", borderRadius: 16, padding: 48, textAlign: "center" as const, cursor: "pointer", marginBottom: 32, position: "relative" as const, transition: "all 0.2s" },
    dropText: { fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 8 },
    dropSubtext: { fontSize: 14, color: "#9ca3af" },
    fileName: { fontSize: 16, fontWeight: 600, color: "#16a34a", marginTop: 8 },
    fileList: { marginTop: 12 },
    fileItem: { fontSize: 13, color: "#6b7280", marginTop: 4 },
    fileInput: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" },

    loadingStatus: { marginTop: 16, padding: 16, background: "#eff6ff", borderRadius: 8, color: "#1d4ed8", fontSize: 14, textAlign: "center" as const },
};
