import { useState } from "react";
import { TUMModuleMapping, PersonalData } from "../types";
import { useNavigate } from "react-router-dom";
import { AnalyticsResponse } from "../types/analyticsTypes";
import { analyzeModules } from "../services/analyticsApi";
import { mockAnalyticsData } from "../data/mockAnalyticsData";
import {
    CheckCircle2,
    User,
    BookOpen,
    FileText,
    ArrowLeft,
    PlayCircle,
    Pencil,
    X,
    Loader2,
    Save,
    AlertTriangle,
    Eye
} from "lucide-react";
import { TUM_COLORS } from "../styles/tumStyles";

type Props = {
    personalData: PersonalData;
    onPersonalDataChange: (data: PersonalData) => void;
    mappingFile: File | null;
    tumModules: TUMModuleMapping[];
    onSubmit: () => void;
    onAnalyticsReady?: (data: AnalyticsResponse) => void;
};

// Field configuration for display
const personalDataFields: { key: keyof PersonalData; label: string }[] = [
    { key: "firstName", label: "First Name" },
    { key: "surname", label: "Surname" },
    { key: "streetAndHouseNumber", label: "Street & House No." },
    { key: "zipLocationCountry", label: "ZIP, Location, Country" },
    { key: "phoneNumber", label: "Phone Number" },
    { key: "tumEmail", label: "TUM Email" },
    { key: "courseAtTUM", label: "Course at TUM" },
    { key: "aimedDegree", label: "Aimed Degree" },
    { key: "registrationNumberAtTUM", label: "Registration No. at TUM" },
    { key: "semesterAtTUM", label: "Semester at TUM" },
    { key: "nameOfPreviousUniversity", label: "Previous University" },
    { key: "countryOfPreviousUniversity", label: "Country of Prev. University" },
    { key: "previousDegreeProgram", label: "Previous Degree Program" },
    { key: "diploma", label: "Diploma" },
    { key: "numberOfSemestersInPreviousCourse", label: "Semesters in Prev. Course" },
    { key: "workloadOfOneCredit", label: "Workload per Credit" },
    { key: "maximumGradeAtFormerUniversity", label: "Max Grade (Former Uni)" },
    { key: "minimumPassingGradeAtFormerUniversity", label: "Min Passing Grade" },
];

export default function FinalReviewPage({
    personalData,
    onPersonalDataChange,
    mappingFile,
    tumModules,
    onSubmit,
    onAnalyticsReady
}: Props) {
    const navigate = useNavigate();
    const [expandedContent, setExpandedContent] = useState<string | null>(null);
    const [expandedModule, setExpandedModule] = useState<string>("");
    const [editingPersonalData, setEditingPersonalData] = useState(false);
    const [tempPersonalData, setTempPersonalData] = useState<PersonalData>(personalData);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [showDataSourceModal, setShowDataSourceModal] = useState(false);

    const handleSubmit = () => {
        if (tumModules.length === 0) {
            alert("No mappings to submit.");
            return;
        }
        onSubmit();
    };

    const handleOpenAnalyticsModal = () => {
        setShowDataSourceModal(true);
        setAnalysisError(null);
    };

    const handleUseDummyData = () => {
        setShowDataSourceModal(false);
        if (onAnalyticsReady) {
            onAnalyticsReady(mockAnalyticsData);
        }
        navigate('/analytics');
    };

    const handleUseRealData = async () => {
        setShowDataSourceModal(false);

        // Check if we have data to analyze
        if (tumModules.length === 0) {
            setAnalysisError(
                "No module data available. Please upload a mapping file first, or use dummy data to preview the analytics page."
            );
            return;
        }

        // Check if modules have required content
        const hasContent = tumModules.some(mod =>
            mod.tum_content || mod.tum_outcome ||
            mod.source_courses.some(sc => sc.source_content)
        );

        if (!hasContent) {
            setAnalysisError(
                "Module data is incomplete. Learning outcomes and content are required for analysis. Please ensure modules have content loaded, or use dummy data to preview the analytics page."
            );
            return;
        }

        setIsAnalyzing(true);
        setAnalysisError(null);

        try {
            // Call the backend API (uses LLM service configured in backend .env)
            const result = await analyzeModules({
                tumModules,
                studentName: `${personalData.firstName} ${personalData.surname}`,
                previousUniversity: personalData.nameOfPreviousUniversity,
                previousCountry: personalData.countryOfPreviousUniversity,
            });

            if (onAnalyticsReady) {
                onAnalyticsReady(result);
            }
            navigate('/analytics');
        } catch (error) {
            console.error("Analysis failed:", error);
            const errorMessage = error instanceof Error ? error.message : "Analysis failed";

            // Provide more helpful error messages
            if (errorMessage.includes("LLM_API_KEY not configured")) {
                setAnalysisError(
                    "Backend LLM API key not configured. Please set LLM_API_KEY in your backend .env file, or use dummy data to preview the analytics page."
                );
            } else if (errorMessage.includes("fetch")) {
                setAnalysisError(
                    "Cannot connect to backend server. Make sure the backend is running on port 8000, or use dummy data to preview the analytics page."
                );
            } else {
                setAnalysisError(errorMessage);
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleViewContent = (moduleNr: string, content: string) => {
        setExpandedModule(moduleNr);
        setExpandedContent(content);
    };

    const handleEditPersonalData = () => {
        setTempPersonalData(personalData);
        setEditingPersonalData(true);
    };

    const handleSavePersonalData = () => {
        if (!tempPersonalData.firstName.trim() || !tempPersonalData.surname.trim()) {
            alert("First name and surname are required.");
            return;
        }
        onPersonalDataChange(tempPersonalData);
        setEditingPersonalData(false);
    };

    const displayValue = (value: string) => value.trim() || "—";

    const totalSourceCourses = tumModules.reduce((sum, m) => sum + m.source_courses.length, 0);

    return (
        <div style={styles.container}>
            {/* Data Source Selection Modal */}
            {showDataSourceModal && (
                <div style={styles.modalOverlay} onClick={() => setShowDataSourceModal(false)}>
                    <div style={styles.dataSourceModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, fontSize: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <PlayCircle size={24} color={TUM_COLORS.blue} />
                                Analytics Preview
                            </h3>
                            <button onClick={() => setShowDataSourceModal(false)} style={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        <p style={{ color: TUM_COLORS.gray50, marginBottom: 24, lineHeight: 1.6 }}>
                            Choose how you'd like to view the analytics page:
                        </p>

                        <div style={styles.dataSourceOptions}>
                            {/* Dummy Data Option */}
                            <button
                                onClick={handleUseDummyData}
                                style={styles.dataSourceCard}
                            >
                                <div style={styles.dataSourceIcon}>🎭</div>
                                <div style={styles.dataSourceTitle}>Use Demo Data</div>
                                <p style={styles.dataSourceDesc}>
                                    Preview the analytics page with realistic sample data.
                                    Perfect for exploring the UI without actual module data.
                                </p>
                                <span style={styles.recommendedBadge}>✨ Recommended for Preview</span>
                            </button>

                            {/* Real Data Option */}
                            <button
                                onClick={handleUseRealData}
                                style={{ ...styles.dataSourceCard, ...styles.realDataCard }}
                                disabled={isAnalyzing}
                            >
                                <div style={styles.dataSourceIcon}>📊</div>
                                <div style={styles.dataSourceTitle}>
                                    {isAnalyzing ? "Analyzing..." : "Use Real Data"}
                                </div>
                                <p style={styles.dataSourceDesc}>
                                    Send your mapping data to the AI model for analysis.
                                    Requires a configured backend and LLM API key.
                                </p>
                                {isAnalyzing && (
                                    <div style={{ marginTop: 12, color: TUM_COLORS.blue, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                                        <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                        Running Analysis...
                                    </div>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content View Modal */}
            {expandedContent && (
                <div style={styles.modalOverlay} onClick={() => setExpandedContent(null)}>
                    <div style={styles.contentModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BookOpen size={20} color={TUM_COLORS.blue} />
                                Module Content: {expandedModule}
                            </h3>
                            <button onClick={() => setExpandedContent(null)} style={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <pre style={styles.preContent}>{expandedContent}</pre>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Personal Data Modal */}
            {editingPersonalData && (
                <div style={styles.modalOverlay} onClick={() => setEditingPersonalData(false)}>
                    <div style={styles.editModal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Pencil size={20} color={TUM_COLORS.blue} />
                                Edit Personal Data
                            </h3>
                            <button onClick={() => setEditingPersonalData(false)} style={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={styles.modalContentScroll}>
                            <div style={styles.editFormGrid}>
                                {personalDataFields.map(({ key, label }) => (
                                    <div key={key} style={styles.fieldGroup}>
                                        <label style={styles.label}>{label}</label>
                                        <input
                                            type="text"
                                            value={tempPersonalData[key]}
                                            onChange={(e) =>
                                                setTempPersonalData({ ...tempPersonalData, [key]: e.target.value })
                                            }
                                            style={styles.input}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={styles.modalActions}>
                            <button
                                onClick={() => setEditingPersonalData(false)}
                                style={styles.secondaryBtn}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSavePersonalData}
                                style={styles.primaryBtn}
                            >
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.header}>
                <h1 style={styles.title}>
                    <CheckCircle2 size={28} color={TUM_COLORS.blue} />
                    Final Review & Submit
                </h1>
                <p style={styles.subtitle}>
                    Review your data before submitting. You can edit your personal details if needed.
                </p>
            </div>

            {analysisError && (
                <div style={styles.errorBox}>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <strong>Analysis Error</strong>
                            <div style={{ fontSize: 13, marginTop: 4 }}>{analysisError}</div>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.reviewGrid}>
                {/* Personal Data Section */}
                <div style={styles.sectionCard}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>
                            <User size={20} color={TUM_COLORS.blue} />
                            Personal Data
                        </h2>
                        <button onClick={handleEditPersonalData} style={styles.editBtn}>
                            <Pencil size={14} /> Edit
                        </button>
                    </div>
                    <div style={styles.dataGrid}>
                        {personalDataFields.map(({ key, label }) => (
                            <div key={key} style={styles.dataItem}>
                                <div style={styles.dataLabel}>{label}</div>
                                <div style={styles.dataValue}>{displayValue(personalData[key])}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mappings Section */}
                <div style={styles.sectionCard}>
                    <div style={styles.cardHeader}>
                        <h2 style={styles.cardTitle}>
                            <BookOpen size={20} color={TUM_COLORS.blue} />
                            Module Mappings
                        </h2>
                        <div style={styles.badge}>
                            {tumModules.length} Modules • {totalSourceCourses} Source Courses
                        </div>
                    </div>

                    {mappingFile && (
                        <div style={styles.fileInfo}>
                            <FileText size={16} color={TUM_COLORS.gray50} />
                            <span>Source File: <strong>{mappingFile.name}</strong></span>
                        </div>
                    )}

                    <div style={styles.mappingsList}>
                        {tumModules.map((mod, idx) => (
                            <div key={mod.id} style={styles.mappingItem}>
                                <div style={styles.mappingHeader}>
                                    <div style={styles.mappingIndex}>{idx + 1}</div>
                                    <div style={styles.mappingTitle}>
                                        <strong>{mod.tum_module_nr}</strong> {mod.tum_module_title}
                                        <span style={styles.ectsBadge}>{mod.tum_ects} ECTS</span>
                                    </div>
                                    {(mod.tum_content || mod.tum_outcome) && (
                                        <button
                                            onClick={() => handleViewContent(mod.tum_module_nr, (mod.tum_content || "") + "\n\n" + (mod.tum_outcome || ""))}
                                            style={styles.viewContentBtn}
                                            title="View Content"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    )}
                                </div>
                                <div style={styles.sourceCoursesList}>
                                    {mod.source_courses.map(sc => (
                                        <div key={sc.id} style={styles.sourceItem}>
                                            <div style={styles.sourceLine}>
                                                ↳ <strong>{sc.source_course_no}</strong> {sc.source_course_name}
                                                <span style={styles.sourceCredits}>
                                                    ({sc.source_credits} Credits, Grade: {sc.source_grade})
                                                </span>
                                            </div>
                                            {sc.source_content && (
                                                <button
                                                    onClick={() => handleViewContent(sc.source_course_no, sc.source_content || "")}
                                                    style={styles.viewContentBtnSmall}
                                                    title="View Content"
                                                >
                                                    <FileText size={12} /> Content
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={styles.actions}>
                <button onClick={() => navigate("/student/catalogue")} style={styles.secondaryBtn}>
                    <ArrowLeft size={16} />
                    Back
                </button>
                <div style={{ display: "flex", gap: 12 }}>
                    {/* Placeholder Submit -> e.g. generate PDF */}
                    <button onClick={handleSubmit} style={styles.primaryBtn} title="Takes you back to start for now">
                        <CheckCircle2 size={16} />
                        Submit Application
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: 40,
        maxWidth: 1100,
        margin: "0 auto",
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
        minHeight: '100vh',
        backgroundColor: TUM_COLORS.grayBg,
    },
    header: { marginBottom: 32, textAlign: "center" as const },
    title: {
        fontSize: 32,
        fontWeight: 700,
        color: TUM_COLORS.gray80,
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    subtitle: { fontSize: 16, color: TUM_COLORS.gray50 },

    errorBox: {
        padding: 16,
        background: "rgba(239, 68, 68, 0.1)",
        border: `1px solid ${TUM_COLORS.error}`,
        borderRadius: 8,
        color: TUM_COLORS.error,
        marginBottom: 24
    },

    reviewGrid: { display: "flex", flexDirection: "column" as const, gap: 24, marginBottom: 32 },

    sectionCard: {
        background: TUM_COLORS.white,
        borderRadius: 8,
        border: `1px solid ${TUM_COLORS.gray20}`,
        overflow: "hidden" as const,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
    },
    cardHeader: {
        padding: "16px 20px",
        borderBottom: `1px solid ${TUM_COLORS.gray20}`,
        background: TUM_COLORS.grayBg,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 600,
        color: TUM_COLORS.gray80,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    editBtn: {
        padding: "6px 12px",
        fontSize: 13,
        borderRadius: 6,
        border: `1px solid ${TUM_COLORS.gray20}`,
        background: TUM_COLORS.white,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        color: TUM_COLORS.gray80,
    },
    badge: {
        fontSize: 13,
        color: TUM_COLORS.blue,
        background: "rgba(0, 101, 189, 0.1)",
        padding: "4px 10px",
        borderRadius: 12,
        fontWeight: 500
    },

    // Personal Data Grid
    dataGrid: {
        padding: 20,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: 16
    },
    dataItem: { marginBottom: 8 },
    dataLabel: { fontSize: 12, color: TUM_COLORS.gray50, marginBottom: 2 },
    dataValue: { fontSize: 14, color: TUM_COLORS.gray80, fontWeight: 500 },

    fileInfo: {
        padding: "12px 20px",
        fontSize: 13,
        color: TUM_COLORS.gray50,
        borderBottom: `1px solid ${TUM_COLORS.gray20}`,
        background: "#fafafa",
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },

    mappingsList: { padding: 20, display: "flex", flexDirection: "column" as const, gap: 16 },
    mappingItem: { border: `1px solid ${TUM_COLORS.gray20}`, borderRadius: 8, padding: 12 },
    mappingHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
    mappingIndex: {
        width: 24,
        height: 24,
        background: TUM_COLORS.blue,
        color: TUM_COLORS.white,
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 600
    },
    mappingTitle: { fontSize: 15, color: TUM_COLORS.gray80, flex: 1 },

    ectsBadge: {
        fontSize: 12,
        color: TUM_COLORS.gray50,
        background: TUM_COLORS.grayBg,
        padding: "2px 6px",
        borderRadius: 4,
        marginLeft: 8,
        fontWeight: 400
    },

    viewContentBtn: {
        padding: 6,
        background: "transparent",
        border: "none",
        color: TUM_COLORS.blue,
        cursor: "pointer",
        opacity: 0.7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    sourceCoursesList: { paddingLeft: 36 },
    sourceItem: {
        fontSize: 13,
        color: TUM_COLORS.gray80,
        marginBottom: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
    },
    sourceLine: { flex: 1 },
    sourceCredits: { color: TUM_COLORS.gray50, marginLeft: 6 },
    viewContentBtnSmall: {
        fontSize: 11,
        color: TUM_COLORS.blue,
        background: "rgba(0, 101, 189, 0.05)",
        border: "none",
        padding: "2px 6px",
        borderRadius: 4,
        cursor: "pointer",
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },

    actions: { display: "flex", justifyContent: "space-between", marginTop: 24, paddingBottom: 40 },
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
        fontSize: 15,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    analyticsBtn: {
        padding: "12px 24px",
        background: TUM_COLORS.white,
        color: TUM_COLORS.blue,
        border: `1px solid ${TUM_COLORS.blue}`,
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },

    // Modals
    modalOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
    },
    modalHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        borderBottom: `1px solid ${TUM_COLORS.gray20}`,
        paddingBottom: 16
    },
    closeBtn: {
        background: "transparent",
        border: "none",
        fontSize: 20,
        cursor: "pointer",
        color: TUM_COLORS.gray50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Content Modal
    contentModal: {
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        width: "90%",
        maxWidth: 600,
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column" as const
    },
    modalBody: { overflowY: "auto" as const, flex: 1 },
    preContent: {
        whiteSpace: "pre-wrap" as const,
        fontSize: 13,
        lineHeight: 1.5,
        background: TUM_COLORS.grayBg,
        padding: 16,
        borderRadius: 8,
        fontFamily: "monospace",
        margin: 0,
        color: TUM_COLORS.gray80,
    },

    // Edit Modal
    editModal: {
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        width: "90%",
        maxWidth: 800,
        maxHeight: "90vh",
        display: "flex",
        flexDirection: "column" as const
    },
    modalContentScroll: { overflowY: "auto" as const, flex: 1, paddingRight: 8 },
    editFormGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: 20
    },
    fieldGroup: { display: "flex", flexDirection: "column" as const, gap: 6 },
    label: { fontSize: 13, fontWeight: 500, color: TUM_COLORS.gray80 },
    input: {
        padding: "8px 12px",
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 6,
        fontSize: 14,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    modalActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
        marginTop: 24,
        paddingTop: 16,
        borderTop: `1px solid ${TUM_COLORS.gray20}`
    },

    // Data Source Modal
    dataSourceModal: {
        background: "#fff",
        borderRadius: 16,
        padding: 32,
        width: "90%",
        maxWidth: 500,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    },
    dataSourceOptions: { display: "grid", gap: 16 },
    dataSourceCard: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "flex-start",
        padding: 20,
        background: "#fff",
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 12,
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "left" as const,
    },
    realDataCard: {
        borderColor: TUM_COLORS.blue,
        background: "rgba(0, 101, 189, 0.02)",
    },
    dataSourceIcon: { fontSize: 24, marginBottom: 12 },
    dataSourceTitle: { fontSize: 16, fontWeight: 700, color: TUM_COLORS.gray80, marginBottom: 4 },
    dataSourceDesc: { fontSize: 13, color: TUM_COLORS.gray50, margin: 0, lineHeight: 1.4 },
    recommendedBadge: {
        marginTop: 12,
        fontSize: 12,
        color: "#d97706",
        background: "#fef3c7",
        padding: "4px 8px",
        borderRadius: 6,
        fontWeight: 500,
    },
};
