import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { extractCatalogueContent, lookupTUMModule } from "../api/courses";
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
    const [loadingTumContent, setLoadingTumContent] = useState(false);
    const [tumLookupDone, setTumLookupDone] = useState(false);
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const navigate = useNavigate();

    const toggleModuleExpand = (moduleId: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        });
    };

    // Fetch TUM module content on mount
    useEffect(() => {
        const fetchTUMContent = async () => {
            if (tumLookupDone) return;
            setLoadingTumContent(true);

            const enrichedModules = await Promise.all(
                tumModules.map(async (mod) => {
                    if (mod.tum_module_nr && !mod.tum_content) {
                        const lookup = await lookupTUMModule(mod.tum_module_nr);
                        if (lookup.found) {
                            return {
                                ...mod,
                                tum_content: lookup.module_content || "",
                                tum_outcome: lookup.module_outcome || "",
                            };
                        }
                    }
                    return mod;
                })
            );

            setUpdatedModules(enrichedModules);
            setLoadingTumContent(false);
            setTumLookupDone(true);
        };

        fetchTUMContent();
    }, [tumModules, tumLookupDone]);

    // Match extracted courses to source courses in modules
    const matchCourses = (extracted: CourseContent[], modules: TUMModuleMapping[]): TUMModuleMapping[] => {
        return modules.map((mod) => ({
            ...mod,
            source_courses: mod.source_courses.map((sc) => {
                const match = extracted.find((course) => {
                    const numberMatch = course.module_number?.toLowerCase().includes(sc.source_course_no.toLowerCase()) ||
                        sc.source_course_no.toLowerCase().includes(course.module_number?.toLowerCase() || "");
                    const nameMatch = course.module_name?.toLowerCase().includes(sc.source_course_name.toLowerCase()) ||
                        sc.source_course_name.toLowerCase().includes(course.module_name?.toLowerCase() || "");
                    return numberMatch || nameMatch;
                });

                return match ? { ...sc, source_content: match.module_content } : sc;
            }),
        }));
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

            const matched = matchCourses(allExtracted, updatedModules.length > 0 ? updatedModules : tumModules);
            setUpdatedModules(matched);
            setShowReview(true);
        } catch (err: any) {
            setError(err.message || "Extraction failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSourceContentChange = (tumModuleId: string, sourceCourseId: string, content: string) => {
        setUpdatedModules((prev) =>
            prev.map((mod) => {
                if (mod.id === tumModuleId) {
                    return {
                        ...mod,
                        source_courses: mod.source_courses.map((sc) =>
                            sc.id === sourceCourseId ? { ...sc, source_content: content } : sc
                        ),
                    };
                }
                return mod;
            })
        );
    };

    const handleConfirm = () => {
        // Validation: Ensure every source course has content
        const missingContentCourses = updatedModules.flatMap(mod =>
            mod.source_courses.filter(sc => !sc.source_content || !sc.source_content.trim())
        );

        if (missingContentCourses.length > 0) {
            alert(`Please fill in content for all source courses. ${missingContentCourses.length} course(s) are missing content.`);
            return;
        }
        onContentConfirmed(updatedModules);
        navigate("/review");
    };

    const handleSkipToManual = () => {
        const modulesToUse = updatedModules.length > 0 ? updatedModules : tumModules;
        setUpdatedModules(modulesToUse);
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

    // Get current modules for display
    const modulesToDisplay = updatedModules.length > 0 ? updatedModules : tumModules;

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

                            <div style={{ marginTop: 24 }}>
                                <label style={{ ...styles.label, fontSize: 13, color: "#374151", marginBottom: 12 }}>
                                    📝 Source Course Content {mod.source_courses.length > 1 ? "(One per source course)" : ""}
                                </label>

                                {mod.source_courses.map((sc) => (
                                    <div key={sc.id} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: "3px solid #e5e7eb" }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: "#4b5563", marginBottom: 6 }}>
                                            {sc.source_course_no} - {sc.source_course_name}
                                        </div>
                                        <textarea
                                            value={sc.source_content || ""}
                                            onChange={(e) => handleSourceContentChange(mod.id, sc.id, e.target.value)}
                                            placeholder={`Enter content/outcomes for ${sc.source_course_name}...`}
                                            style={{
                                                ...styles.textarea,
                                                minHeight: 100,
                                                borderColor: sc.source_content ? "#d1d5db" : "#fbbf24",
                                            }}
                                        />
                                    </div>
                                ))}
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

            {/* TUM Content Preview Section */}
            {loadingTumContent ? (
                <div style={styles.loadingStatus}>🔄 Loading TUM module content...</div>
            ) : (
                <div style={styles.tumPreviewSection}>
                    <h3 style={styles.previewTitle}>📖 TUM Module Content Reference</h3>
                    <p style={styles.previewSubtitle}>Click on a module to see its content and learning outcomes.</p>
                    <div style={styles.tumPreviewList}>
                        {modulesToDisplay.map((mod) => {
                            const isExpanded = expandedModules.has(mod.id);
                            const hasContent = mod.tum_content || mod.tum_outcome;
                            return (
                                <div key={mod.id} style={styles.tumPreviewCard}>
                                    <div
                                        style={{
                                            ...styles.tumPreviewHeader,
                                            cursor: hasContent ? "pointer" : "default",
                                        }}
                                        onClick={() => hasContent && toggleModuleExpand(mod.id)}
                                    >
                                        <span style={{ flex: 1 }}>
                                            <strong>{mod.tum_module_nr}</strong> - {mod.tum_module_title} ({mod.tum_ects} ECTS)
                                        </span>
                                        {hasContent ? (
                                            <span style={styles.expandIcon}>{isExpanded ? "▼" : "▶"}</span>
                                        ) : (
                                            <span style={styles.notFoundBadge}>Module not found, Check for typos or check in TUM Online</span>
                                        )}
                                    </div>
                                    {isExpanded && hasContent && (
                                        <div style={styles.tumPreviewContent}>
                                            {mod.tum_content && (
                                                <div style={styles.tumPreviewText}>
                                                    <strong>Content:</strong>
                                                    <div style={styles.tumContentExpanded}>{mod.tum_content.replace(/<br>/g, '\n')}</div>
                                                </div>
                                            )}
                                            {mod.tum_outcome && (
                                                <div style={styles.tumPreviewText}>
                                                    <strong>Learning Outcomes:</strong>
                                                    <div style={styles.tumContentExpanded}>{mod.tum_outcome.replace(/<br>/g, '\n')}</div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

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

    // TUM Content Preview
    tumPreviewSection: { marginBottom: 32, padding: 20, background: "#f0f9ff", borderRadius: 12, border: "1px solid #bae6fd" },
    previewTitle: { fontSize: 16, fontWeight: 600, color: "#0369a1", margin: 0, marginBottom: 4 },
    previewSubtitle: { fontSize: 13, color: "#0284c7", marginBottom: 16 },
    tumPreviewList: { display: "flex", flexDirection: "column" as const, gap: 8, maxHeight: 500, overflowY: "auto" as const, paddingRight: 8 },
    tumPreviewCard: { background: "#fff", borderRadius: 8, border: "1px solid #e0f2fe", overflow: "visible" as const, flexShrink: 0 },
    tumPreviewHeader: { display: "flex", alignItems: "center", padding: "12px 16px", fontSize: 14, color: "#0369a1", background: "#f8fafc", borderRadius: "8px 8px 0 0" },
    tumPreviewContent: { padding: "12px 16px", fontSize: 12, color: "#475569", background: "#fff", borderTop: "1px solid #e0f2fe", borderRadius: "0 0 8px 8px" },
    tumPreviewText: { marginBottom: 12 },
    tumContentExpanded: { marginTop: 6, whiteSpace: "pre-wrap" as const, lineHeight: 1.5, maxHeight: 150, overflowY: "auto" as const, padding: 8, background: "#f8fafc", borderRadius: 4, fontSize: 12 },
    expandIcon: { fontSize: 12, color: "#0284c7", marginLeft: 8 },
    notFoundBadge: { fontSize: 11, color: "#9ca3af", padding: "2px 8px", background: "#f3f4f6", borderRadius: 4 },
    tumPreviewNotFound: { fontSize: 12, color: "#9ca3af", fontStyle: "italic" as const },

    modulesList: { display: "flex", flexDirection: "column" as const, gap: 20, marginBottom: 32 },
    moduleCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, boxShadow: "0 2px 4px rgb(0 0 0 / 0.05)" },
    moduleHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
    tumBadge: { padding: "6px 12px", background: "#3b82f6", color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600 },
    moduleNr: { fontSize: 15, fontWeight: 600, color: "#374151" },
    moduleTitle: { fontSize: 13, color: "#6b7280" },
    sourceCount: { marginLeft: "auto", fontSize: 12, color: "#9ca3af" },

    sourceCoursesList: { display: "flex", flexWrap: "wrap" as const, gap: 8 },
    sourceTag: { padding: "4px 10px", background: "#f3f4f6", borderRadius: 4, fontSize: 12, color: "#4b5563" },

    // TUM Content Display
    tumContentBox: { marginTop: 16, padding: 16, background: "#f0f9ff", borderRadius: 8, border: "1px solid #bae6fd" },
    tumContentHeader: { fontSize: 13, fontWeight: 600, color: "#0369a1", marginBottom: 12 },
    tumContentSection: { marginBottom: 12 },
    tumContentText: { fontSize: 12, color: "#475569", marginTop: 4, whiteSpace: "pre-wrap" as const, maxHeight: 150, overflowY: "auto" as const },
    tumContentNotFound: { marginTop: 12, padding: 12, background: "#fffbeb", borderRadius: 6, fontSize: 12, color: "#92400e" },

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
