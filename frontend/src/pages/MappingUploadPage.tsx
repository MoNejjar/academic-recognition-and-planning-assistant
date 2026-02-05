import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { extractMappingTable } from "../api/courses";
import { TUMModuleMapping, SourceCourse, createEmptySourceCourse, createEmptyTUMModule } from "../types";
import { Upload, FileText, ArrowLeft, ArrowRight, Plus, Trash2, X, BookOpen, Loader2, PenLine } from "lucide-react";
import { TUM_COLORS } from "../styles/tumStyles";
import { mockTUMModules } from "../data/mockTUMModules";

type Props = {
    onMappingsConfirmed: (file: File | null, modules: TUMModuleMapping[]) => void;
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

    const handleFillDemoData = () => {
        // Strip out content/outcomes to simulate just the mapping table extraction
        const demoMappings = mockTUMModules.map(m => ({
            ...m,
            tum_content: "", // Content comes later
            tum_outcome: "",
            source_courses: m.source_courses.map(sc => ({
                ...sc,
                source_content: "" // Content comes later
            }))
        }));
        setTumModules(demoMappings);
        setShowReview(true);
    };

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
                if (mod.source_courses.length <= 1) return mod;
                return {
                    ...mod,
                    source_courses: mod.source_courses.filter((sc) => sc.id !== courseId),
                };
            })
        );
    };

    const handleConfirm = () => {
        if (tumModules.length === 0) return;

        const invalidModules = tumModules.filter(
            mod => !mod.tum_module_nr.trim() || !mod.tum_module_title.trim() || !mod.tum_ects.trim()
        );

        if (invalidModules.length > 0) {
            alert("Please fill in all TUM module fields (Module No., Title, ECTS).");
            return;
        }

        const invalidSourceCourses = tumModules.some(mod =>
            mod.source_courses.length === 0 ||
            mod.source_courses.some(sc =>
                !sc.source_course_no.trim() ||
                !sc.source_course_name.trim() ||
                !sc.source_credits.trim() ||
                !sc.source_grade.trim()
            )
        );

        if (invalidSourceCourses) {
            alert("Please ensure every TUM module has at least one source course, and all source course fields are filled.");
            return;
        }

        onMappingsConfirmed(file, tumModules);
        navigate("/student/catalogue");
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
                    <h1 style={styles.title}>
                        <BookOpen size={28} color={TUM_COLORS.blue} />
                        Review TUM Module Mappings
                    </h1>
                    <p style={styles.subtitle}>
                        Each TUM module shows its equivalent source courses. You can add, edit, or remove courses.
                    </p>
                </div>

                {/* Stats */}
                <div style={styles.statsRow}>
                    <div style={styles.statBadge}>
                        <BookOpen size={16} />
                        {tumModules.length} TUM Modules
                    </div>
                    <div style={styles.statBadge}>
                        <FileText size={16} />
                        {tumModules.reduce((sum, m) => sum + m.source_courses.length, 0)} Source Courses
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
                                    <Trash2 size={16} />
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
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleAddSourceCourse(mod.id)}
                                    style={styles.addSourceBtn}
                                >
                                    <Plus size={14} />
                                    Add Source Course
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Module Button */}
                <button onClick={handleAddModule} style={styles.addModuleBtn}>
                    <Plus size={18} />
                    Add TUM Module
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
                        <ArrowLeft size={16} />
                        Upload New File
                    </button>
                    <button
                        onClick={handleConfirm}
                        style={styles.primaryBtn}
                        disabled={tumModules.length === 0}
                    >
                        Continue to Catalogue Upload
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // Upload view
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <BookOpen size={28} color={TUM_COLORS.blue} />
                    Create Module Mappings
                </h1>
                <p style={styles.subtitle}>
                    Choose how you want to enter your TUM module mappings. You can either upload an existing PDF document for automatic extraction or create them manually.
                </p>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            {/* Two equal option cards */}
            <div style={styles.optionsContainer}>
                {/* PDF Upload Option */}
                <div
                    style={{
                        ...styles.optionCard,
                        borderColor: dragActive ? TUM_COLORS.blue : file ? TUM_COLORS.green : TUM_COLORS.gray20,
                        background: dragActive ? "rgba(0, 101, 189, 0.05)" : file ? "rgba(162, 173, 0, 0.05)" : TUM_COLORS.white,
                    }}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div style={styles.optionIcon}>
                        {file ? (
                            <FileText size={48} color={TUM_COLORS.green} />
                        ) : (
                            <Upload size={48} color={TUM_COLORS.blue} />
                        )}
                    </div>
                    <h2 style={styles.optionTitle}>Upload PDF</h2>
                    <p style={styles.optionDescription}>
                        {file
                            ? `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                            : "Upload your course recognition PDF to automatically extract mappings"
                        }
                    </p>

                    <div style={styles.optionDropzone}>
                        {file ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                }}
                                style={styles.changeFileBtn}
                            >
                                <X size={14} />
                                Remove File
                            </button>
                        ) : (
                            <>
                                <div style={styles.dropText}>Drag & drop PDF</div>
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

                    <button
                        onClick={handleExtract}
                        disabled={!file || loading}
                        style={{
                            ...styles.optionBtn,
                            background: TUM_COLORS.blue,
                            color: TUM_COLORS.white,
                            opacity: !file || loading ? 0.5 : 1,
                            cursor: !file || loading ? "not-allowed" : "pointer",
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                Extracting...
                            </>
                        ) : (
                            <>
                                Extract Mappings
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </div>

                {/* Divider */}
                <div style={styles.divider}>
                    <span style={styles.dividerText}>OR</span>
                </div>

                {/* Manual Entry Option */}
                <div style={styles.optionCard}>
                    <div style={styles.optionIcon}>
                        <PenLine size={48} color={TUM_COLORS.blue} />
                    </div>
                    <h2 style={styles.optionTitle}>Manual Entry</h2>
                    <p style={styles.optionDescription}>
                        Create your module mappings manually by entering the details yourself
                    </p>

                    <div style={styles.optionFeatures}>
                        <div style={styles.featureItem}>✓ Full control over entries</div>
                        <div style={styles.featureItem}>✓ No document required</div>
                        <div style={styles.featureItem}>✓ Add/edit anytime</div>
                    </div>

                    <button
                        onClick={handleSkipToManual}
                        style={{
                            ...styles.optionBtn,
                            background: TUM_COLORS.blue,
                            color: TUM_COLORS.white,
                        }}
                    >
                        Start Manual Entry
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Demo button at bottom */}
            <div style={styles.demoSection}>
                <button onClick={handleFillDemoData} style={styles.demoBtn}>
                    <BookOpen size={16} />
                    Try Demo Data
                </button>
                <span style={styles.demoText}>See how it works with sample data</span>
            </div>

            {/* Back button */}
            <div style={styles.backSection}>
                <button onClick={() => navigate("/student")} style={styles.secondaryBtn}>
                    <ArrowLeft size={16} />
                    Back to Dashboard
                </button>
            </div>

            {loading && (
                <div style={styles.loadingStatus}>
                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                    Extracting mappings from PDF... This may take some time.
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: 40,
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "'Inter', sans-serif",
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
    },
    header: { marginBottom: 32 },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: '#1e293b',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    subtitle: { fontSize: 14, color: '#64748b', margin: 0 },
    errorBox: {
        padding: 16,
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 8,
        color: "#dc2626",
        marginBottom: 24
    },


    // Stats
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

    // Module card
    modulesList: { display: "flex", flexDirection: "column" as const, gap: 20, marginBottom: 24 },
    moduleCard: {
        background: TUM_COLORS.white,
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 8,
        padding: 20,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    moduleHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
    tumBadge: {
        padding: "6px 12px",
        background: TUM_COLORS.blue,
        color: TUM_COLORS.white,
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600
    },
    moduleInputs: { display: "flex", gap: 8, flex: 1 },
    inputNr: {
        width: 140,
        padding: "8px 12px",
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    inputTitle: {
        flex: 1,
        padding: "8px 12px",
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 6,
        fontSize: 14,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    inputEcts: {
        width: 70,
        padding: "8px 12px",
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 6,
        fontSize: 14,
        textAlign: "center" as const,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    deleteModuleBtn: {
        padding: "8px 12px",
        background: "rgba(239, 68, 68, 0.1)",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        color: TUM_COLORS.error,
        display: 'flex',
        alignItems: 'center',
    },

    // Source courses
    sourceCoursesList: { paddingLeft: 24, borderLeft: `3px solid ${TUM_COLORS.blue}` },
    sourceLabel: { fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 12, fontWeight: 500 },
    sourceCourseRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
    sourceIndex: { width: 24, color: TUM_COLORS.gray50, fontSize: 13 },
    sourceInputNo: {
        width: 100,
        padding: "6px 10px",
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 4,
        fontSize: 13,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    sourceInputName: {
        flex: 1,
        padding: "6px 10px",
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 4,
        fontSize: 13,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    sourceInputSmall: {
        width: 60,
        padding: "6px 10px",
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 4,
        fontSize: 13,
        textAlign: "center" as const,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    deleteSourceBtn: {
        padding: "4px 8px",
        background: "transparent",
        border: "none",
        color: TUM_COLORS.gray50,
        cursor: "pointer",
        display: 'flex',
        alignItems: 'center',
    },
    addSourceBtn: {
        marginTop: 8,
        padding: "6px 12px",
        background: TUM_COLORS.grayBg,
        border: `1px dashed ${TUM_COLORS.gray20}`,
        borderRadius: 4,
        color: TUM_COLORS.gray50,
        cursor: "pointer",
        fontSize: 13,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },

    addModuleBtn: {
        width: "100%",
        padding: 16,
        background: "rgba(162, 173, 0, 0.1)",
        border: `2px dashed ${TUM_COLORS.green}`,
        borderRadius: 8,
        color: TUM_COLORS.green,
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 500,
        marginBottom: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },

    // Actions
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

    // Upload
    dropzone: {
        border: `2px dashed ${TUM_COLORS.gray20}`,
        borderRadius: 8,
        padding: 48,
        textAlign: "center" as const,
        cursor: "pointer",
        marginBottom: 32,
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
    fileSize: { fontSize: 14, color: TUM_COLORS.gray50 },
    fileInput: { position: "absolute" as const, top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" },

    // Loading
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

    // Options layout
    optionsContainer: {
        display: 'flex',
        gap: 24,
        marginBottom: 32,
        alignItems: 'stretch',
    },
    optionCard: {
        flex: 1,
        background: TUM_COLORS.white,
        border: `2px solid ${TUM_COLORS.gray20}`,
        borderRadius: 12,
        padding: 32,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        textAlign: 'center' as const,
        transition: 'all 0.2s ease',
        position: 'relative' as const,
    },
    optionIcon: {
        marginBottom: 16,
    },
    optionTitle: {
        fontSize: 20,
        fontWeight: 600,
        color: '#1e293b',
        marginBottom: 8,
        margin: 0,
    },
    optionDescription: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 24,
        lineHeight: 1.5,
        minHeight: 42,
    },
    optionDropzone: {
        width: '100%',
        padding: 24,
        border: `2px dashed ${TUM_COLORS.gray20}`,
        borderRadius: 8,
        marginBottom: 24,
        cursor: 'pointer',
        position: 'relative' as const,
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionBtn: {
        padding: '14px 28px',
        border: 'none',
        borderRadius: 8,
        fontSize: 15,
        fontWeight: 600,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
        marginTop: 'auto',
    },
    changeFileBtn: {
        padding: '8px 16px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: 'none',
        borderRadius: 6,
        color: TUM_COLORS.error,
        cursor: 'pointer',
        fontSize: 13,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 8px',
    },
    dividerText: {
        padding: '12px 16px',
        background: TUM_COLORS.grayBg,
        borderRadius: 20,
        color: TUM_COLORS.gray50,
        fontSize: 13,
        fontWeight: 600,
    },
    optionFeatures: {
        width: '100%',
        padding: 24,
        background: TUM_COLORS.grayBg,
        borderRadius: 8,
        marginBottom: 24,
        minHeight: 80,
    },
    featureItem: {
        fontSize: 14,
        color: '#475569',
        marginBottom: 8,
        textAlign: 'left' as const,
    },
    demoSection: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 24,
        padding: 16,
        background: 'rgba(255, 152, 0, 0.05)',
        borderRadius: 8,
        border: `1px solid rgba(255, 152, 0, 0.2)`,
    },
    demoBtn: {
        padding: '10px 20px',
        background: TUM_COLORS.white,
        color: TUM_COLORS.orange,
        border: `1px solid ${TUM_COLORS.orange}`,
        borderRadius: 8,
        cursor: 'pointer',
        fontSize: 14,
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    demoText: {
        fontSize: 13,
        color: TUM_COLORS.gray50,
    },
    backSection: {
        display: 'flex',
        justifyContent: 'flex-start',
    },
};
