import { useState } from "react";
import { TUMModuleMapping, PersonalData } from "../types";
import { useNavigate } from "react-router-dom";

type Props = {
    personalData: PersonalData;
    onPersonalDataChange: (data: PersonalData) => void;
    mappingFile: File | null;
    tumModules: TUMModuleMapping[];
    onSubmit: () => void;
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

export default function FinalReviewPage({ personalData, onPersonalDataChange, mappingFile, tumModules, onSubmit }: Props) {
    const navigate = useNavigate();
    const [expandedContent, setExpandedContent] = useState<string | null>(null);
    const [expandedModule, setExpandedModule] = useState<string>("");
    const [editingPersonalData, setEditingPersonalData] = useState(false);
    const [tempPersonalData, setTempPersonalData] = useState<PersonalData>(personalData);

    const handleSubmit = () => {
        if (tumModules.length === 0) {
            alert("No mappings to submit.");
            return;
        }
        onSubmit();
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
            {/* Content Modal */}
            {expandedContent && (
                <div style={styles.modalOverlay} onClick={() => setExpandedContent(null)}>
                    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0 }}>📖 Content for {expandedModule}</h3>
                            <button onClick={() => setExpandedContent(null)} style={styles.closeBtn}>✕</button>
                        </div>
                        <div style={styles.modalContent}>
                            {expandedContent}
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Personal Data Modal */}
            {editingPersonalData && (
                <div style={styles.modalOverlay} onClick={() => setEditingPersonalData(false)}>
                    <div style={{ ...styles.modal, maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0 }}>✏️ Edit Personal Data</h3>
                            <button onClick={() => setEditingPersonalData(false)} style={styles.closeBtn}>✕</button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                            {personalDataFields.map(({ key, label }) => (
                                <div key={key} style={{ marginBottom: 8 }}>
                                    <label style={{ display: "block", fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</label>
                                    <input
                                        type="text"
                                        value={tempPersonalData[key]}
                                        onChange={(e) => setTempPersonalData({ ...tempPersonalData, [key]: e.target.value })}
                                        style={styles.input}
                                    />
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "flex-end" }}>
                            <button onClick={() => setEditingPersonalData(false)} style={styles.secondaryBtn}>Cancel</button>
                            <button onClick={handleSavePersonalData} style={styles.editBtn}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={styles.header}>
                <h1 style={styles.title}>Final Review</h1>
                <p style={styles.subtitle}>Review all your information before submitting</p>
            </div>

            {/* Personal Data Section */}
            <div style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={styles.sectionTitle}>👤 Personal Data</h2>
                    <button onClick={handleEditPersonalData} style={styles.editBtn}>✏️ Edit</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {personalDataFields.map(({ key, label }) => (
                        <div key={key}>
                            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 2 }}>{label}</div>
                            <div style={{ fontSize: 14, fontWeight: 500, color: personalData[key] ? "#111827" : "#9ca3af" }}>
                                {displayValue(personalData[key])}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {mappingFile && (
                <div style={styles.fileInfo}>
                    📄 Source file: <strong>{mappingFile.name}</strong>
                </div>
            )}

            {/* Stats */}
            <div style={styles.statsRow}>
                <div style={styles.statBadge}>📚 {tumModules.length} TUM Modules</div>
                <div style={styles.statBadge}>📝 {totalSourceCourses} Source Courses</div>
            </div>

            {/* TUM Modules */}
            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>📋 TUM Module Mappings</h2>
                {tumModules.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                        <p>No mappings to display.</p>
                        <button onClick={() => navigate("/mapping")} style={styles.secondaryBtn}>← Go to Mapping</button>
                    </div>
                ) : (
                    <div style={styles.modulesList}>
                        {tumModules.map((mod) => (
                            <div key={mod.id} style={styles.moduleCard}>
                                <div style={styles.moduleHeader}>
                                    <div style={styles.tumBadge}>TUM</div>
                                    <div>
                                        <div style={styles.moduleNr}>{mod.tum_module_nr}</div>
                                        <div style={styles.moduleTitle}>{mod.tum_module_title} ({mod.tum_ects} ECTS)</div>
                                    </div>
                                </div>

                                <div style={styles.sourceCoursesList}>
                                    <div style={styles.sourceLabel}>↳ Equivalent Source Courses:</div>
                                    {mod.source_courses.map((sc) => (
                                        <div key={sc.id} style={styles.sourceCourseRow}>
                                            <span style={styles.sourceNo}>{sc.source_course_no}</span>
                                            <span style={styles.sourceName}>{sc.source_course_name}</span>
                                            <span style={styles.sourceCredits}>{sc.source_credits} CP</span>
                                            <span style={styles.sourceGrade}>Grade: {sc.source_grade}</span>
                                            {sc.source_content && (
                                                <button
                                                    onClick={() => handleViewContent(`${sc.source_course_no} - ${sc.source_course_name}`, sc.source_content!)}
                                                    style={{ ...styles.viewBtn, marginLeft: 12, padding: "4px 8px", fontSize: 11 }}
                                                >
                                                    📖 Content
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
    container: { padding: 40, width: "100%", maxWidth: 1200, margin: "0 auto", fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: 32, textAlign: "center" as const },
    title: { fontSize: 32, fontWeight: 700, color: "#111827", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#6b7280" },
    sectionTitle: { fontSize: 18, fontWeight: 600, color: "#374151", margin: 0 },
    fileInfo: { padding: 12, background: "#f3f4f6", borderRadius: 8, marginBottom: 24, color: "#374151", fontSize: 14 },
    card: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", border: "1px solid #e5e7eb", marginBottom: 24 },
    emptyState: { textAlign: "center" as const, padding: 64, background: "#f9fafb", borderRadius: 12, color: "#6b7280" },

    statsRow: { display: "flex", gap: 16, justifyContent: "center", marginBottom: 24 },
    statBadge: { padding: "8px 16px", background: "#eff6ff", color: "#1d4ed8", borderRadius: 20, fontSize: 14, fontWeight: 500 },

    modulesList: { display: "flex", flexDirection: "column" as const, gap: 16 },
    moduleCard: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 },
    moduleHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
    tumBadge: { padding: "6px 12px", background: "#3b82f6", color: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600 },
    moduleNr: { fontSize: 15, fontWeight: 600, color: "#374151" },
    moduleTitle: { fontSize: 13, color: "#6b7280" },

    sourceCoursesList: { paddingLeft: 24, borderLeft: "3px solid #e5e7eb" },
    sourceLabel: { fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 500 },
    sourceCourseRow: { display: "flex", gap: 12, alignItems: "center", padding: "6px 0", fontSize: 13 },
    sourceNo: { fontWeight: 600, color: "#4f46e5", minWidth: 80 },
    sourceName: { flex: 1, color: "#374151" },
    sourceCredits: { color: "#6b7280", minWidth: 50 },
    sourceGrade: { color: "#16a34a", fontWeight: 500, minWidth: 80 },

    actions: { display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap" as const },
    secondaryBtn: { padding: "12px 24px", background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 500 },
    submitBtn: { padding: "14px 32px", background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16, fontWeight: 600, boxShadow: "0 4px 6px -1px rgb(34 197 94 / 0.4)" },
    editBtn: { padding: "8px 16px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontWeight: 500 },
    viewBtn: { marginLeft: "auto", padding: "6px 12px", background: "#dbeafe", color: "#1d4ed8", border: "1px solid #93c5fd", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 500 },
    input: { width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14, boxSizing: "border-box" as const },
    modalOverlay: { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    modal: { background: "#fff", borderRadius: 16, padding: 32, maxWidth: 900, width: "95%", maxHeight: "85vh", overflowY: "auto" as const, overflowX: "hidden" as const, boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)" },
    modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #e5e7eb" },
    modalContent: { fontSize: 14, lineHeight: 1.6, color: "#374151", whiteSpace: "pre-wrap" as const, overflowWrap: "anywhere" as const, wordBreak: "break-word" as const },
    closeBtn: { background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer", fontSize: 14 },
};
