import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { extractCatalogueContent, lookupTUMModule } from "../api/courses";
import { TUMModuleMapping, CourseContent } from "../types";
import { Upload, FileText, ArrowLeft, ArrowRight, BookOpen, Loader2, PenLine, ChevronDown, ChevronRight, AlertTriangle, Wand2 } from "lucide-react";
import { TUM_COLORS } from "../styles/tumStyles";
import { mockTUMModules } from "../data/mockTUMModules";

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
        const missingContentCourses = updatedModules.flatMap(mod =>
            mod.source_courses.filter(sc => !sc.source_content || !sc.source_content.trim())
        );

        if (missingContentCourses.length > 0) {
            alert(`Please fill in content for all source courses. ${missingContentCourses.length} course(s) are missing content.`);
            return;
        }
        onContentConfirmed(updatedModules);
        navigate("/student/review");
    };

    const handleSkipToManual = () => {
        const modulesToUse = updatedModules.length > 0 ? updatedModules : tumModules;
        setUpdatedModules(modulesToUse);
        setShowReview(true);
    };

    const handleFillDemoContent = () => {
        // Merge existing modules with demo content
        // We match by module NR to be safe, or just use the demo data if it matches
        const modulesToUse = updatedModules.length > 0 ? updatedModules : tumModules;

        const demoFilled = modulesToUse.map(mod => {
            const demoMatch = mockTUMModules.find(dm => dm.tum_module_nr === mod.tum_module_nr);
            if (demoMatch) {
                return {
                    ...mod,
                    tum_content: demoMatch.tum_content,
                    tum_outcome: demoMatch.tum_outcome,
                    source_courses: mod.source_courses.map((sc, idx) => {
                        const demoSc = demoMatch.source_courses[idx];
                        return {
                            ...sc,
                            source_content: demoSc ? demoSc.source_content : sc.source_content
                        }
                    })
                };
            }
            return mod;
        });

        setUpdatedModules(demoFilled);
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

    const modulesToDisplay = updatedModules.length > 0 ? updatedModules : tumModules;

    // Review View
    if (showReview) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>
                        <FileText size={28} color={TUM_COLORS.blue} />
                        Review Extracted Content
                    </h1>
                    <p style={styles.subtitle}>Review and edit the catalogue content for each TUM module.</p>
                </div>

                <div style={styles.warningBox}>
                    <AlertTriangle size={18} color={TUM_COLORS.orange} />
                    <span><strong>Important:</strong> Auto-matching is not 100% accurate. Please verify that each content matches the correct TUM module.</span>
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
                                <label style={{ fontSize: 13, color: TUM_COLORS.gray80, marginBottom: 12, display: 'block', fontWeight: 500 }}>
                                    Source Course Content {mod.source_courses.length > 1 ? "(One per source course)" : ""}
                                </label>

                                {mod.source_courses.map((sc) => (
                                    <div key={sc.id} style={{ marginBottom: 16, paddingLeft: 12, borderLeft: `3px solid ${TUM_COLORS.blue}` }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: TUM_COLORS.gray80, marginBottom: 6 }}>
                                            {sc.source_course_no} - {sc.source_course_name}
                                        </div>
                                        <textarea
                                            value={sc.source_content || ""}
                                            onChange={(e) => handleSourceContentChange(mod.id, sc.id, e.target.value)}
                                            placeholder={`Enter content/outcomes for ${sc.source_course_name}...`}
                                            style={{
                                                ...styles.textarea,
                                                minHeight: 100,
                                                borderColor: sc.source_content ? TUM_COLORS.gray20 : TUM_COLORS.orange,
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
                        <ArrowLeft size={16} />
                        Upload Different Files
                    </button>
                    <button onClick={handleConfirm} style={styles.primaryBtn}>
                        Continue to Review
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // Upload View
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <Upload size={28} color={TUM_COLORS.blue} />
                    Upload Course Catalogues
                </h1>
                <p style={styles.subtitle}>
                    Upload catalogue PDFs to auto-match content to your TUM modules.
                </p>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.statsRow}>
                <div style={styles.statBadge}>
                    <BookOpen size={16} />
                    {tumModules.length} TUM Modules to match
                </div>
            </div>

            {/* TUM Content Preview Section */}
            {loadingTumContent ? (
                <div style={styles.loadingStatus}>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                    Loading TUM module content...
                </div>
            ) : (
                <div style={styles.tumPreviewSection}>
                    <h3 style={styles.previewTitle}>
                        <BookOpen size={18} />
                        TUM Module Content Reference
                    </h3>
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
                                            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                                        ) : (
                                            <span style={styles.notFoundBadge}>Module not found</span>
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
                    borderColor: dragActive ? TUM_COLORS.blue : files.length > 0 ? TUM_COLORS.green : TUM_COLORS.gray20,
                    background: dragActive ? "rgba(0, 101, 189, 0.05)" : files.length > 0 ? "rgba(162, 173, 0, 0.05)" : TUM_COLORS.white,
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {files.length > 0 ? (
                    <>
                        <FileText size={48} color={TUM_COLORS.green} />
                        <div style={styles.fileName}>{files.length} file(s) selected</div>
                        <div style={styles.fileList}>
                            {files.map((f, i) => <div key={i} style={styles.fileItem}>{f.name}</div>)}
                        </div>
                    </>
                ) : (
                    <>
                        <Upload size={48} color={TUM_COLORS.gray50} />
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
                <button onClick={() => navigate("/student/mapping")} style={styles.secondaryBtn}>
                    <ArrowLeft size={16} />
                    Back
                </button>
                <button onClick={handleSkipToManual} style={styles.secondaryBtn}>
                    <PenLine size={16} />
                    Manual
                </button>
                <button onClick={handleFillDemoContent} style={{ ...styles.secondaryBtn, borderColor: TUM_COLORS.orange, color: TUM_COLORS.orange }}>
                    <Wand2 size={16} />
                    Demo Fill
                </button>
                <button
                    onClick={handleExtract}
                    disabled={files.length === 0 || loading}
                    style={{
                        ...styles.primaryBtn,
                        opacity: files.length === 0 || loading ? 0.5 : 1,
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                            Extracting...
                        </>
                    ) : (
                        <>
                            Extract & Match
                            <ArrowRight size={16} />
                        </>
                    )}
                </button>
            </div>

            {loading && (
                <div style={styles.loadingStatus}>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                    Extracting content from PDFs... This may take some time.
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
<<<<<<< HEAD
    container: {
        padding: 32,
        maxWidth: 1000,
        margin: "0 auto",
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
        minHeight: '100vh',
        backgroundColor: TUM_COLORS.grayBg,
    },
    header: { marginBottom: 24 },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: TUM_COLORS.gray80,
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    subtitle: { fontSize: 14, color: TUM_COLORS.gray50, margin: 0 },
    errorBox: {
        padding: 16,
        background: "rgba(239, 68, 68, 0.1)",
        border: `1px solid ${TUM_COLORS.error}`,
        borderRadius: 8,
        color: TUM_COLORS.error,
        marginBottom: 24
    },
    warningBox: {
        padding: 16,
        background: "rgba(227, 114, 34, 0.1)",
        border: `1px solid ${TUM_COLORS.orange}`,
        borderRadius: 8,
        color: TUM_COLORS.gray80,
        marginBottom: 24,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
=======
    container: { padding: 40, width: "100%", maxWidth: 1000, margin: "0 auto", fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: 32, textAlign: "center" as const },
    title: { fontSize: 32, fontWeight: 700, color: "#111827", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#6b7280" },
    errorBox: { padding: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", marginBottom: 24 },
    warningBox: { padding: 16, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, color: "#92400e", marginBottom: 24, fontSize: 14 },
>>>>>>> origin/main

    statsRow: { display: "flex", gap: 16, marginBottom: 24 },
    statBadge: {
        padding: "8px 16px",
        background: "rgba(0, 101, 189, 0.1)",
        color: TUM_COLORS.blue,
        borderRadius: 20,
        fontSize: 14,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },

    // TUM Content Preview
    tumPreviewSection: {
        marginBottom: 24,
        padding: 20,
        background: "rgba(152, 198, 234, 0.2)",
        borderRadius: 8,
        border: `1px solid ${TUM_COLORS.lightBlue2}`
    },
    previewTitle: {
        fontSize: 16,
        fontWeight: 600,
        color: TUM_COLORS.blue,
        margin: 0,
        marginBottom: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    previewSubtitle: { fontSize: 13, color: TUM_COLORS.gray50, marginBottom: 16 },
    tumPreviewList: { display: "flex", flexDirection: "column" as const, gap: 8, maxHeight: 400, overflowY: "auto" as const, paddingRight: 8 },
    tumPreviewCard: { background: TUM_COLORS.white, borderRadius: 8, border: `1px solid ${TUM_COLORS.gray20}`, overflow: "visible" as const, flexShrink: 0 },
    tumPreviewHeader: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        fontSize: 14,
        color: TUM_COLORS.gray80,
        background: TUM_COLORS.grayBg,
        borderRadius: "8px 8px 0 0"
    },
    tumPreviewContent: {
        padding: "12px 16px",
        fontSize: 12,
        color: TUM_COLORS.gray80,
        background: TUM_COLORS.white,
        borderTop: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: "0 0 8px 8px"
    },
    tumPreviewText: { marginBottom: 12 },
    tumContentExpanded: {
        marginTop: 6,
        whiteSpace: "pre-wrap" as const,
        lineHeight: 1.5,
        maxHeight: 150,
        overflowY: "auto" as const,
        padding: 8,
        background: TUM_COLORS.grayBg,
        borderRadius: 4,
        fontSize: 12
    },
    notFoundBadge: { fontSize: 11, color: TUM_COLORS.gray50, padding: "2px 8px", background: TUM_COLORS.grayBg, borderRadius: 4 },

    modulesList: { display: "flex", flexDirection: "column" as const, gap: 20, marginBottom: 24 },
    moduleCard: {
        background: TUM_COLORS.white,
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 8,
        padding: 20,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    moduleHeader: { display: "flex", alignItems: "center", gap: 12 },
    tumBadge: {
        padding: "6px 12px",
        background: TUM_COLORS.blue,
        color: TUM_COLORS.white,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600
    },
    moduleNr: { fontSize: 15, fontWeight: 600, color: TUM_COLORS.gray80 },
    moduleTitle: { fontSize: 13, color: TUM_COLORS.gray50 },
    sourceCount: { marginLeft: "auto", fontSize: 12, color: TUM_COLORS.gray50 },

    textarea: {
        width: "100%",
        minHeight: 120,
        padding: 12,
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 6,
        fontSize: 14,
        resize: "vertical" as const,
        boxSizing: "border-box" as const,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },

    actions: { display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap" as const },
    secondaryBtn: {
        padding: "12px 24px",
        background: TUM_COLORS.white,
        color: TUM_COLORS.gray80,
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    primaryBtn: {
        padding: "12px 24px",
        background: TUM_COLORS.blue,
        color: TUM_COLORS.white,
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 14,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },

    dropzone: {
        border: `2px dashed ${TUM_COLORS.gray20}`,
        borderRadius: 8,
        padding: 48,
        textAlign: "center" as const,
        cursor: "pointer",
        marginBottom: 24,
        position: "relative" as const,
        transition: "all 0.2s",
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 12,
    },
    dropText: { fontSize: 16, fontWeight: 600, color: TUM_COLORS.gray80 },
    dropSubtext: { fontSize: 14, color: TUM_COLORS.gray50 },
    fileName: { fontSize: 16, fontWeight: 600, color: TUM_COLORS.green },
    fileList: { marginTop: 8 },
    fileItem: {
        fontSize: 13, color: TUM_COLORS.gray50, marginTop: 4
    },
    fileInput: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" },

    loadingStatus: {
        marginTop: 16,
        padding: 16,
        background: "rgba(0, 101, 189, 0.1)",
        borderRadius: 8,
        color: TUM_COLORS.blue,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
};
