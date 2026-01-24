import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PersonalData } from "../types";
import { User, GraduationCap, Building2, BarChart3, Zap, ArrowRight, Wand2 } from "lucide-react";
import { TUM_COLORS } from "../styles/tumStyles";

type Props = {
    onDataConfirmed: (data: PersonalData) => void;
    existingData?: PersonalData;
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
    semesterAtTUM: "3",
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
    const navigate = useNavigate();

    useEffect(() => {
        if (existingData) {
            setFormData(existingData);
        }
    }, [existingData]);

    const handleChange = (field: keyof PersonalData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleContinue = () => {
        // Only first name and surname are mandatory
        if (!formData.firstName.trim() || !formData.surname.trim()) {
            setError("First name and surname are required.");
            return;
        }
        setError(null);
        onDataConfirmed(formData);
        navigate("/student/mapping");
    };

    const handleFillDemoData = () => {
        setFormData(demoPersonalData);
        setError(null);
    };

    const renderField = (
        label: string,
        field: keyof PersonalData,
        placeholder: string = "",
        required: boolean = false
    ) => (
        <div style={styles.fieldGroup}>
            <label style={styles.label}>
                {label} {required && <span style={{ color: TUM_COLORS.error }}>*</span>}
            </label>
            <input
                type="text"
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder}
                style={styles.input}
                onFocus={(e) => e.target.style.borderColor = TUM_COLORS.blue}
                onBlur={(e) => e.target.style.borderColor = TUM_COLORS.gray20}
            />
        </div>
    );

    return (
        <div style={styles.container}>
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
                {/* Left Column: Personal Data & TUM */}
                <div style={styles.column}>
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <User size={20} color={TUM_COLORS.blue} />
                            Personal Data
                        </h2>
                        {renderField("First name", "firstName", "Your first name", true)}
                        {renderField("Surname", "surname", "Your surname", true)}
                        {renderField("Street and house number", "streetAndHouseNumber", "e.g., Musterstraße 123")}
                        {renderField("ZIP, Location, Country", "zipLocationCountry", "e.g., 80333 Munich, Germany")}
                        {renderField("Phone number", "phoneNumber", "e.g., +49 123 456 7890")}
                        {renderField("TUM Email address", "tumEmail", "e.g., name@tum.de")}
                    </div>

                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <GraduationCap size={20} color={TUM_COLORS.blue} />
                            Course at TUM
                        </h2>
                        {renderField("Course at TUM", "courseAtTUM", "e.g., Informatics")}
                        {renderField("Aimed Degree", "aimedDegree", "e.g., Bachelor of Science")}
                        {renderField("Registration number at TUM", "registrationNumberAtTUM", "e.g., 12345678")}
                        {renderField("Semester at TUM", "semesterAtTUM", "e.g., 3")}
                    </div>
                </div>

                {/* Right Column: Previous University */}
                <div style={styles.column}>
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <Building2 size={20} color={TUM_COLORS.blue} />
                            Previous Course & University
                        </h2>
                        {renderField("Name of previous University", "nameOfPreviousUniversity", "e.g., TU Delft")}
                        {renderField("Country of previous University", "countryOfPreviousUniversity", "e.g., Netherlands")}
                        {renderField("Previous Degree program", "previousDegreeProgram", "e.g., Computer Science")}
                        {renderField("Diploma", "diploma", "e.g., Bachelor")}
                        {renderField("Number of semesters in previous course", "numberOfSemestersInPreviousCourse", "e.g., 6")}
                        {renderField("Workload of one credit", "workloadOfOneCredit", "e.g., 1 CP = 30 h")}
                    </div>

                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>
                            <BarChart3 size={20} color={TUM_COLORS.blue} />
                            Grading System
                        </h2>
                        {renderField("Maximum grade at your former University", "maximumGradeAtFormerUniversity", "e.g., 10")}
                        {renderField("Minimum passing grade at your former University", "minimumPassingGradeAtFormerUniversity", "e.g., 6")}
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
        padding: 32,
        maxWidth: 1200,
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
    formContainer: { display: "flex", gap: 24, flexWrap: "wrap" as const },
    column: { flex: 1, minWidth: 300, display: "flex", flexDirection: "column" as const, gap: 24 },
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
