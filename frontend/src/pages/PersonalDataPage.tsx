import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PersonalData } from "../types";
import { User, GraduationCap, Building2, BarChart3, Zap, ArrowRight, Wand2, AlertCircle } from "lucide-react";
import { TUM_COLORS } from "../styles/tumStyles";
import Toast from "../components/common/Toast";

type Props = {
    onDataConfirmed: (data: PersonalData) => void;
    existingData?: PersonalData;
};

type FieldValidation = {
    [K in keyof PersonalData]?: string | null;
};

// Validation functions
const validateMatriculationNumber = (value: string): string | null => {
    if (!value) return null; // Empty is OK for optional fields, but required check is separate
    if (!/^\d{8}$/.test(value)) {
        return "Must be exactly 8 digits";
    }
    return null;
};

const validateEmail = (value: string): string | null => {
    if (!value) return null;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Invalid email format";
    }
    if (value && !value.toLowerCase().endsWith('@tum.de')) {
        return "Must be a TUM email address (@tum.de)";
    }
    return null;
};

const validatePhoneNumber = (value: string): string | null => {
    if (!value) return null;
    if (!/^[\d\s+()-]+$/.test(value)) {
        return "Invalid phone number format";
    }
    return null;
};

const validateNumeric = (value: string, fieldName: string): string | null => {
    if (!value) return null;
    if (!/^\d+$/.test(value)) {
        return `${fieldName} must be a number`;
    }
    return null;
};

const validateGrade = (value: string): string | null => {
    if (!value) return null;
    if (!/^[\d.]+$/.test(value)) {
        return "Grade must be a number";
    }
    return null;
};

// Demo data for quick testing
const demoPersonalData: PersonalData = {
    firstName: "Max",
    surname: "Mustermann",
    streetAndHouseNumber: "Arcisstraße 21",
    zipLocationCountry: "80333 Munich, Germany",
    phoneNumber: "+49 89 289 01",
    tumEmail: "max.mustermann@tum.de",
    courseAtTUM: "Informatics",
    aimedDegree: "Bachelor of Science",
    registrationNumberAtTUM: "03712345",
    semesterAtTUM: "1",
    nameOfPreviousUniversity: "ETH Zürich",
    countryOfPreviousUniversity: "Switzerland",
    previousDegreeProgram: "Computer Science",
    diploma: "Bachelor of Science",
    numberOfSemestersInPreviousCourse: "4",
    workloadOfOneCredit: "1 ECTS = 30 h",
    maximumGradeAtFormerUniversity: "6.0",
    minimumPassingGradeAtFormerUniversity: "4.0",
};

export default function PersonalDataPage({ onDataConfirmed, existingData }: Props) {
    const [formData, setFormData] = useState<PersonalData>(existingData || {
        firstName: "",
        surname: "",
        streetAndHouseNumber: "",
        zipLocationCountry: "",
        phoneNumber: "",
        tumEmail: "",
        courseAtTUM: "",
        aimedDegree: "",
        registrationNumberAtTUM: "",
        semesterAtTUM: "",
        nameOfPreviousUniversity: "",
        countryOfPreviousUniversity: "",
        previousDegreeProgram: "",
        diploma: "",
        numberOfSemestersInPreviousCourse: "",
        workloadOfOneCredit: "",
        maximumGradeAtFormerUniversity: "",
        minimumPassingGradeAtFormerUniversity: "",
    });
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FieldValidation>({});
    const [touchedFields, setTouchedFields] = useState<Set<keyof PersonalData>>(new Set());
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (existingData) {
            setFormData(existingData);
        }
    }, [existingData]);

    const validateField = (field: keyof PersonalData, value: string): string | null => {
        switch (field) {
            case 'registrationNumberAtTUM':
                return validateMatriculationNumber(value);
            case 'tumEmail':
                return validateEmail(value);
            case 'phoneNumber':
                return validatePhoneNumber(value);
            case 'numberOfSemestersInPreviousCourse':
                return validateNumeric(value, 'Number of semesters');
            case 'maximumGradeAtFormerUniversity':
            case 'minimumPassingGradeAtFormerUniversity':
                return validateGrade(value);
            default:
                return null;
        }
    };

    const handleChange = (field: keyof PersonalData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        
        // Validate field on change if it's been touched
        if (touchedFields.has(field) || value) {
            const validationError = validateField(field, value);
            setFieldErrors((prev) => ({ ...prev, [field]: validationError }));
        }
    };

    const handleBlur = (field: keyof PersonalData) => {
        setTouchedFields((prev) => new Set(prev).add(field));
        const validationError = validateField(field, formData[field]);
        setFieldErrors((prev) => ({ ...prev, [field]: validationError }));
    };

    const handleContinue = () => {
        // Only matriculation number is mandatory
        if (!formData.registrationNumberAtTUM.trim()) {
            const errorMsg = "Matriculation number is required.";
            setError(errorMsg);
            setToastMessage(errorMsg);
            return;
        }

        // Check all field validations
        const hasErrors = Object.values(fieldErrors).some(error => error !== null);
        if (hasErrors) {
            const errorMsg = "Please fix all validation errors before continuing.";
            setError(errorMsg);
            setToastMessage(errorMsg);
            return;
        }

        setError(null);
        onDataConfirmed(formData);
        navigate("/student/mapping");
    };

    const handleFillDemoData = () => {
        setFormData(demoPersonalData);
        setError(null);
        setFieldErrors({});
    };

    const renderField = (
        label: string,
        field: keyof PersonalData,
        placeholder: string = "",
        required: boolean = false
    ) => {
        const hasError = fieldErrors[field];
        const showError = touchedFields.has(field) && hasError;

        return (
            <div style={styles.fieldGroup}>
                <label style={styles.label}>
                    {label} {required && <span style={{ color: TUM_COLORS.error }}>*</span>}
                </label>
                <input
                    type="text"
                    value={formData[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onBlur={() => handleBlur(field)}
                    placeholder={placeholder}
                    style={{
                        ...styles.input,
                        borderColor: showError ? TUM_COLORS.error : TUM_COLORS.gray20,
                    }}
                    onFocus={(e) => {
                        if (!showError) {
                            e.target.style.borderColor = TUM_COLORS.blue;
                        }
                    }}
                />
                {showError && (
                    <div style={styles.fieldError}>
                        <AlertCircle size={14} />
                        {hasError}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            {toastMessage && (
                <Toast
                    message={toastMessage}
                    type="error"
                    onClose={() => setToastMessage(null)}
                />
            )}
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <User size={28} color={TUM_COLORS.blue} />
                    Personal Data & Course Information
                </h1>
                <p style={styles.subtitle}>
                    Please fill in your personal information and details about your previous university.
                </p>
            </div>

            {/* Quick Fill Banner */}
            <div style={styles.demoBanner}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Zap size={24} color={TUM_COLORS.orange} />
                    <div>
                        <div style={{ fontWeight: 600, marginBottom: 2, color: TUM_COLORS.gray80 }}>Quick Demo Mode</div>
                        <div style={{ fontSize: 13, color: TUM_COLORS.gray50 }}>
                            Skip manual entry and fill all fields with sample data to test the system.
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={handleFillDemoData} style={styles.demoBtn}>
                        <Wand2 size={16} />
                        Fill Form
                    </button>

                </div>
            </div>

            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            <div style={styles.formContainer}>
                {/* Left Column: TUM Information */}
                <div style={styles.column}>
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <GraduationCap size={20} color={TUM_COLORS.blue} />
                            Your Information at TUM
                        </h2>
                        {renderField("Matriculation Number", "registrationNumberAtTUM", "e.g., 03712345", true)}
                        <div style={styles.fieldRow}>
                            <div style={styles.fieldHalf}>
                                {renderField("Course at TUM", "courseAtTUM", "e.g., Informatics")}
                            </div>
                            <div style={styles.fieldHalf}>
                                {renderField("Aimed Degree", "aimedDegree", "e.g., Bachelor of Science")}
                            </div>
                        </div>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Semester at TUM</label>
                            <select
                                value={formData.semesterAtTUM}
                                onChange={(e) => handleChange("semesterAtTUM", e.target.value)}
                                style={{ ...styles.input, maxWidth: 200 }}
                                onFocus={(e) => e.currentTarget.style.borderColor = TUM_COLORS.blue}
                                onBlur={(e) => e.currentTarget.style.borderColor = TUM_COLORS.gray20}
                            >
                                <option value="">Select semester</option>
                                <option value="1">1</option>
                                <option value="2">2</option>
                            </select>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <BarChart3 size={20} color={TUM_COLORS.blue} />
                            Grading System at Previous University
                        </h2>
                        <div style={styles.fieldRow}>
                            <div style={styles.fieldHalf}>
                                {renderField("Maximum Grade", "maximumGradeAtFormerUniversity", "e.g., 10 or 6.0")}
                            </div>
                            <div style={styles.fieldHalf}>
                                {renderField("Minimum Passing Grade", "minimumPassingGradeAtFormerUniversity", "e.g., 6 or 4.0")}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Previous University */}
                <div style={styles.column}>
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <Building2 size={20} color={TUM_COLORS.blue} />
                            Previous University
                        </h2>
                        <div style={styles.fieldRow}>
                            <div style={styles.fieldHalf}>
                                {renderField("University Name", "nameOfPreviousUniversity", "e.g., ETH Zürich")}
                            </div>
                            <div style={styles.fieldHalf}>
                                {renderField("Country", "countryOfPreviousUniversity", "e.g., Switzerland")}
                            </div>
                        </div>
                        <div style={styles.fieldRow}>
                            <div style={styles.fieldHalf}>
                                {renderField("Degree Program", "previousDegreeProgram", "e.g., Computer Science")}
                            </div>
                            <div style={styles.fieldHalf}>
                                {renderField("Diploma/Degree", "diploma", "e.g., Bachelor of Science")}
                            </div>
                        </div>
                        <div style={styles.fieldRow}>
                            <div style={styles.fieldHalf}>
                                {renderField("Total Semesters", "numberOfSemestersInPreviousCourse", "e.g., 6")}
                            </div>
                            <div style={styles.fieldHalf}>
                                {renderField("Credit Workload", "workloadOfOneCredit", "e.g., 1 ECTS = 30 h")}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={styles.actions}>
                <button onClick={handleFillDemoData} style={styles.secondaryBtn}>
                    <Wand2 size={16} />
                    Fill Demo Data
                </button>
                <button onClick={handleContinue} style={styles.primaryBtn}>
                    Continue to Mapping Upload
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: 40,
        maxWidth: 1200,
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
    formContainer: { display: "flex", gap: 24, flexWrap: "wrap" as const },
    column: { flex: 1, minWidth: 340, display: "flex", flexDirection: "column" as const, gap: 24 },
    card: {
        background: TUM_COLORS.white,
        borderRadius: 8,
        padding: 24,
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        border: `1px solid ${TUM_COLORS.gray20}`
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 600,
        color: TUM_COLORS.gray80,
        marginBottom: 20,
        paddingBottom: 12,
        borderBottom: `2px solid ${TUM_COLORS.blue}`,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    fieldRow: {
        display: 'flex',
        gap: 16,
        marginBottom: 0,
    },
    fieldHalf: {
        flex: 1,
        minWidth: 0,
    },
    fieldGroup: { marginBottom: 16 },
    label: { display: "block", fontSize: 13, fontWeight: 500, color: TUM_COLORS.gray80, marginBottom: 6 },
    input: {
        width: "100%",
        padding: "10px 12px",
        border: `1px solid ${TUM_COLORS.gray20}`,
        borderRadius: 6,
        fontSize: 14,
        outline: "none",
        transition: "border-color 0.2s",
        boxSizing: "border-box" as const,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    fieldError: {
        marginTop: 6,
        fontSize: 12,
        color: TUM_COLORS.error,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    error: {
        padding: 16,
        background: "rgba(239, 68, 68, 0.1)",
        border: `1px solid ${TUM_COLORS.error}`,
        borderRadius: 8,
        color: TUM_COLORS.error,
        marginBottom: 24
    },
    actions: { marginTop: 32, display: "flex", justifyContent: "flex-end", gap: 12 },
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
    demoBanner: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "16px 20px",
        background: "rgba(152, 198, 234, 0.2)",
        border: `1px solid ${TUM_COLORS.lightBlue2}`,
        borderRadius: 8,
        marginBottom: 24,
        flexWrap: "wrap" as const
    },
    demoBtn: {
        padding: "10px 16px",
        background: TUM_COLORS.orange,
        color: TUM_COLORS.white,
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap" as const,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    },
    skipBtn: {
        padding: "10px 16px",
        background: TUM_COLORS.blue,
        color: TUM_COLORS.white,
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: "nowrap" as const,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: "Arial, 'Helvetica Neue', sans-serif",
    }
};
