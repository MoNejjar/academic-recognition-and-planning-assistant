import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { extractMappingTable } from "../api/courses";
import { TUMModuleMapping, SourceCourse, createEmptySourceCourse, createEmptyTUMModule } from "../types";

type Props = {
    onMappingsConfirmed: (file: File, modules: TUMModuleMapping[]) => void;
    existingModules?: TUMModuleMapping[];
    existingFile?: File | null;
};

export default function MappingUploadPage({ onMappingsConfirmed, existingModules, existingFile }: Props) {
    const [file, setFile] = useState<File | null>(existingFile || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tumModules, setTumModules] = useState<TUMModuleMapping[]>(existingModules || []);
    const [showReview, setShowReview] = useState(existingModules && existingModules.length > 0);
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (existingModules && existingModules.length > 0) {
            setTumModules(existingModules);
            setShowReview(true);
        }
        if (existingFile) {
            setFile(existingFile);
        }
    }, [existingModules, existingFile]);

    const handleExtract = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const result = await extractMappingTable(file);
            if (!result.tum_modules || result.tum_modules.length === 0) {
                setError("No mapping table found in the PDF.");
                return;
            }
            // Add IDs to modules and source courses
            const modules: TUMModuleMapping[] = result.tum_modules.map((mod) => ({
                ...mod,
                id: crypto.randomUUID(),
                catalogue_content: "",
                source_courses: mod.source_courses.map((sc) => ({
                    ...sc,
                    id: crypto.randomUUID(),
                })),
            }));
            setTumModules(modules);
            setShowReview(true);
        } catch (err: any) {
            setError(err.message || "Extraction failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSkipToManual = () => {
        setTumModules([createEmptyTUMModule()]);
        setShowReview(true);
    };

    // Module operations
    const handleModuleChange = (moduleId: string, field: keyof TUMModuleMapping, value: string) => {
        setTumModules((prev) =>
            prev.map((mod) => (mod.id === moduleId ? { ...mod, [field]: value } : mod))
        );
    };

    const handleDeleteModule = (moduleId: string) => {
        setTumModules((prev) => prev.filter((mod) => mod.id !== moduleId));
    };

    const handleAddModule = () => {
        setTumModules((prev) => [...prev, createEmptyTUMModule()]);
    };

    // Source course operations
    const handleSourceCourseChange = (
        moduleId: string,
        courseId: string,
        field: keyof SourceCourse,
        value: string
    ) => {
        setTumModules((prev) =>
            prev.map((mod) => {
                if (mod.id !== moduleId) return mod;
                return {
                    ...mod,
                    source_courses: mod.source_courses.map((sc) =>
                        sc.id === courseId ? { ...sc, [field]: value } : sc
                    ),
                };
            })
        );
    };

    const handleAddSourceCourse = (moduleId: string) => {
        setTumModules((prev) =>
            prev.map((mod) => {
                if (mod.id !== moduleId) return mod;
                return {
                    ...mod,
                    source_courses: [...mod.source_courses, createEmptySourceCourse()],
                };
            })
        );
    };

    const handleDeleteSourceCourse = (moduleId: string, courseId: string) => {
        setTumModules((prev) =>
            prev.map((mod) => {
                if (mod.id !== moduleId) return mod;
                // Keep at least one source course
                if (mod.source_courses.length <= 1) return mod;
                return {
                    ...mod,
                    source_courses: mod.source_courses.filter((sc) => sc.id !== courseId),
                };
            })
        );
    };

    const handleConfirm = () => {
        if (!file || tumModules.length === 0) return;
        onMappingsConfirmed(file, tumModules);
        navigate("/catalogue");
    };

    // Drag and drop
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
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === "application/pdf") {
                setFile(droppedFile);
                setError(null);
            } else {
                setError("Please upload a PDF file.");
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    // Review view
    if (showReview) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Review TUM Module Mappings</h1>
                    <p style={styles.subtitle}>
                        Each TUM module shows its equivalent source courses. You can add, edit, or remove courses.
                    </p>
                </div>

                {/* Stats */}
                <div style={styles.statsRow}>
                    <div style={styles.statBadge}>
                        📚 {tumModules.length} TUM Modules
                    </div>
                    <div style={styles.statBadge}>
                        📝 {tumModules.reduce((sum, m) => sum + m.source_courses.length, 0)} Source Courses
                    </div>
                </div>

                {/* Modules List */}
                <div style={styles.modulesList}>
                    {tumModules.map((mod) => (
                        <div key={mod.id} style={styles.moduleCard}>
                            {/* TUM Module Header */}
                            <div style={styles.moduleHeader}>
                                <div style={styles.tumBadge}>TUM</div>
                                <div style={styles.moduleInputs}>
                                    <input
                                        type="text"
                                        value={mod.tum_module_nr}
                                        onChange={(e) => handleModuleChange(mod.id, "tum_module_nr", e.target.value)}
                                        placeholder="Module Nr. (e.g., INHN0001)"
                                        style={styles.inputNr}
                                    />
                                    <input
                                        type="text"
                                        value={mod.tum_module_title}
                                        onChange={(e) => handleModuleChange(mod.id, "tum_module_title", e.target.value)}
                                        placeholder="Module Title"
                                        style={styles.inputTitle}
                                    />
                                    <input
                                        type="text"
                                        value={mod.tum_ects}
                                        onChange={(e) => handleModuleChange(mod.id, "tum_ects", e.target.value)}
                                        placeholder="ECTS"
                                        style={styles.inputEcts}
                                    />
                                </div>
                                <button
                                    onClick={() => handleDeleteModule(mod.id)}
                                    style={styles.deleteModuleBtn}
                                    title="Delete module"
                                >
                                    🗑️
                                </button>
                            </div>

                            {/* Source Courses */}
                            <div style={styles.sourceCoursesList}>
                                <div style={styles.sourceLabel}>↳ Equivalent Source Courses:</div>
                                {mod.source_courses.map((sc, idx) => (
                                    <div key={sc.id} style={styles.sourceCourseRow}>
                                        <span style={styles.sourceIndex}>{idx + 1}.</span>
                                        <input
                                            type="text"
                                            value={sc.source_course_no}
                                            onChange={(e) =>
                                                handleSourceCourseChange(mod.id, sc.id, "source_course_no", e.target.value)
                                            }
                                            placeholder="Course No."
                                            style={styles.sourceInputNo}
                                        />
                                        <input
                                            type="text"
                                            value={sc.source_course_name}
                                            onChange={(e) =>
                                                handleSourceCourseChange(mod.id, sc.id, "source_course_name", e.target.value)
                                            }
                                            placeholder="Course Name"
                                            style={styles.sourceInputName}
                                        />
                                        <input
                                            type="text"
                                            value={sc.source_credits}
                                            onChange={(e) =>
                                                handleSourceCourseChange(mod.id, sc.id, "source_credits", e.target.value)
                                            }
                                            placeholder="Credits"
                                            style={styles.sourceInputSmall}
                                        />
                                        <input
                                            type="text"
                                            value={sc.source_grade}
                                            onChange={(e) =>
                                                handleSourceCourseChange(mod.id, sc.id, "source_grade", e.target.value)
                                            }
                                            placeholder="Grade"
                                            style={styles.sourceInputSmall}
                                        />
                                        <button
                                            onClick={() => handleDeleteSourceCourse(mod.id, sc.id)}
                                            style={styles.deleteSourceBtn}
                                            title="Remove course"
                                            disabled={mod.source_courses.length <= 1}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleAddSourceCourse(mod.id)}
                                    style={styles.addSourceBtn}
                                >
                                    + Add Source Course
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Module Button */}
                <button onClick={handleAddModule} style={styles.addModuleBtn}>
                    + Add TUM Module
                </button>

                {/* Actions */}
                <div style={styles.actions}>
                    <button
                        onClick={() => {
                            setShowReview(false);
                            setTumModules([]);
                            setFile(null);
                        }}
                        style={styles.secondaryBtn}
                    >
                        ← Upload New File
                    </button>
                    <button
                        onClick={handleConfirm}
                        style={styles.primaryBtn}
                        disabled={tumModules.length === 0}
                    >
                        Continue to Catalogue Upload →
                    </button>
                </div>
            </div>
        );
    }

    // Upload view
    return (
        <div style={styles.container}>

            <div style={styles.header}>
                <h1 style={styles.title}>Upload Mapping Table</h1>
                <p style={styles.subtitle}>
                    Upload your course recognition PDF to extract TUM module mappings.
                </p>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div
                style={{
                    ...styles.dropzone,
                    borderColor: dragActive ? "#8b5cf6" : file ? "#22c55e" : "#d1d5db",
                    background: dragActive ? "#f3e8ff" : file ? "#f0fdf4" : "#fafafa",
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{file ? "✅" : "📄"}</div>
                {file ? (
                    <>
                        <div style={styles.fileName}>{file.name}</div>
                        <div style={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</div>
                    </>
                ) : (
                    <>
                        <div style={styles.dropText}>Drag & drop your PDF here</div>
                        <div style={styles.dropSubtext}>or click to browse</div>
                    </>
                )}
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    style={styles.fileInput}
                />
            </div>

            <div style={styles.actions}>
                <button onClick={() => navigate("/")} style={styles.secondaryBtn}>
                    ← Back
                </button>
                <button onClick={handleSkipToManual} style={styles.secondaryBtn}>
                    Skip (Enter Manually)
                </button>
                <button
                    onClick={handleExtract}
                    disabled={!file || loading}
                    style={{
                        ...styles.primaryBtn,
                        opacity: !file || loading ? 0.5 : 1,
                        cursor: !file || loading ? "not-allowed" : "pointer",
                    }}
                >
                    {loading ? "Extracting..." : "Extract Mappings →"}
                </button>
            </div>

            {loading && (
                <div style={styles.loadingStatus}>
                    🔄 Extracting mappings from PDF... This may take some time.
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: 40, maxWidth: 1100, margin: "0 auto", fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: 32, textAlign: "center" as const },
    title: { fontSize: 32, fontWeight: 700, color: "#111827", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#6b7280" },
    errorBox: { padding: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", marginBottom: 24 },

    // Stats
    statsRow: { display: "flex", gap: 16, justifyContent: "center", marginBottom: 24 },
    statBadge: { padding: "8px 16px", background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, fontSize: 14, fontWeight: 500 },

    // Module card
    modulesList: { display: "flex", flexDirection: "column" as const, gap: 20, marginBottom: 24 },
    moduleCard: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20, boxShadow: "0 2px 4px rgb(0 0 0 / 0.05)" },
    moduleHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
    tumBadge: { padding: "6px 12px", background: "#3b82f6", color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600 },
    moduleInputs: { display: "flex", gap: 8, flex: 1 },
    inputNr: { width: 140, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, fontWeight: 500 },
    inputTitle: { flex: 1, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 },
    inputEcts: { width: 70, padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, textAlign: "center" as const },
    deleteModuleBtn: { padding: "8px 12px", background: "#fee2e2", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 },

    // Source courses
    sourceCoursesList: { paddingLeft: 24, borderLeft: "3px solid #e5e7eb" },
    sourceLabel: { fontSize: 12, color: "#6b7280", marginBottom: 12, fontWeight: 500 },
    sourceCourseRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
    sourceIndex: { width: 24, color: "#9ca3af", fontSize: 13 },
    sourceInputNo: { width: 100, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 13 },
    sourceInputName: { flex: 1, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 13 },
    sourceInputSmall: { width: 60, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 13, textAlign: "center" as const },
    deleteSourceBtn: { padding: "4px 8px", background: "transparent", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 14 },
    addSourceBtn: { marginTop: 8, padding: "6px 12px", background: "#f3f4f6", border: "1px dashed #d1d5db", borderRadius: 4, color: "#6b7280", cursor: "pointer", fontSize: 13 },

    addModuleBtn: { width: "100%", padding: 16, background: "#f0fdf4", border: "2px dashed #22c55e", borderRadius: 12, color: "#16a34a", cursor: "pointer", fontSize: 15, fontWeight: 500, marginBottom: 32 },

    // Actions
    actions: { display: "flex", gap: 12, justifyContent: "space-between", flexWrap: "wrap" as const },
    secondaryBtn: { padding: "12px 24px", background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 500 },
    primaryBtn: { padding: "14px 32px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16, fontWeight: 600, boxShadow: "0 4px 6px -1px rgb(139 92 246 / 0.4)" },

    // Upload
    dropzone: { border: "2px dashed #d1d5db", borderRadius: 16, padding: 48, textAlign: "center" as const, cursor: "pointer", marginBottom: 32, position: "relative" as const, transition: "all 0.2s" },
    dropText: { fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 8 },
    dropSubtext: { fontSize: 14, color: "#9ca3af" },
    fileName: { fontSize: 16, fontWeight: 600, color: "#16a34a", marginTop: 8 },
    fileSize: { fontSize: 14, color: "#6b7280" },
    fileInput: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" },

    // Loading
    loadingStatus: { marginTop: 16, padding: 16, background: "#eff6ff", borderRadius: 8, color: "#1d4ed8", fontSize: 14, textAlign: "center" as const },
};
