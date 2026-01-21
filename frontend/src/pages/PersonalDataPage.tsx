import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PersonalData } from "../types";

type Props = {
    onDataConfirmed: (data: PersonalData) => void;
    existingData?: PersonalData;
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
        navigate("/mapping");
    };

    const renderField = (
        label: string,
        field: keyof PersonalData,
        placeholder: string = "",
        required: boolean = false
    ) => (
        <div style={styles.fieldGroup}>
            <label style={styles.label}>
                {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
            </label>
            <input
                type="text"
                value={formData[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                placeholder={placeholder}
                style={styles.input}
            />
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Personal Data & Course Information</h1>
                <p style={styles.subtitle}>
                    Please fill in your personal information and details about your previous university.
                </p>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.formContainer}>
                {/* Left Column: Personal Data & TUM */}
                <div style={styles.column}>
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>📋 Personal Data</h2>
                        {renderField("First name", "firstName", "Your first name", true)}
                        {renderField("Surname", "surname", "Your surname", true)}
                        {renderField("Street and house number", "streetAndHouseNumber", "e.g., Musterstraße 123")}
                        {renderField("ZIP, Location, Country", "zipLocationCountry", "e.g., 80333 Munich, Germany")}
                        {renderField("Phone number", "phoneNumber", "e.g., +49 123 456 7890")}
                        {renderField("TUM Email address", "tumEmail", "e.g., name@tum.de")}
                    </div>

                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>🎓 Course at TUM</h2>
                        {renderField("Course at TUM", "courseAtTUM", "e.g., Informatics")}
                        {renderField("Aimed Degree", "aimedDegree", "e.g., Bachelor of Science")}
                        {renderField("Registration number at TUM", "registrationNumberAtTUM", "e.g., 12345678")}
                        {renderField("Semester at TUM", "semesterAtTUM", "e.g., 3")}
                    </div>
                </div>

                {/* Right Column: Previous University */}
                <div style={styles.column}>
                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>🏫 Previous Course & University</h2>
                        {renderField("Name of previous University", "nameOfPreviousUniversity", "e.g., TU Delft")}
                        {renderField("Country of previous University", "countryOfPreviousUniversity", "e.g., Netherlands")}
                        {renderField("Previous Degree program", "previousDegreeProgram", "e.g., Computer Science")}
                        {renderField("Diploma", "diploma", "e.g., Bachelor")}
                        {renderField("Number of semesters in previous course", "numberOfSemestersInPreviousCourse", "e.g., 6")}
                        {renderField(
                            "Workload of one credit",
                            "workloadOfOneCredit",
                            "e.g., 1 CP = 30 h"
                        )}
                    </div>

                    <div style={styles.card}>
                        <h2 style={styles.sectionTitle}>📊 Grading System</h2>
                        {renderField("Maximum grade at your former University", "maximumGradeAtFormerUniversity", "e.g., 10")}
                        {renderField("Minimum passing grade at your former University", "minimumPassingGradeAtFormerUniversity", "e.g., 6")}
                    </div>
                </div>
            </div>

            <div style={styles.actions}>
                <button onClick={handleContinue} style={styles.primaryBtn}>
                    Continue to Mapping Upload →
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
    formContainer: { display: "flex", gap: 24, flexWrap: "wrap" as const },
    column: { flex: 1, minWidth: 300, display: "flex", flexDirection: "column" as const, gap: 24 },
    card: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)", border: "1px solid #e5e7eb" },
    sectionTitle: { fontSize: 18, fontWeight: 600, color: "#374151", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #e5e7eb" },
    fieldGroup: { marginBottom: 16 },
    label: { display: "block", fontSize: 14, fontWeight: 500, color: "#374151", marginBottom: 6 },
    input: { width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, outline: "none", transition: "border-color 0.15s", boxSizing: "border-box" as const },
    error: { padding: 16, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", marginBottom: 24 },
    actions: { marginTop: 32, display: "flex", justifyContent: "flex-end" },
    primaryBtn: { padding: "14px 32px", background: "linear-gradient(135deg, #8b5cf6, #7c3aed)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 16, fontWeight: 600, boxShadow: "0 4px 6px -1px rgb(139 92 246 / 0.4)" },
};
