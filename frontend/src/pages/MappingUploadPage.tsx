import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { extractMappingTable } from "../api/courses";
import { MappingRow } from "../types";

type Props = {
    onMappingsConfirmed: (file: File, rows: MappingRow[]) => void;
    existingRows?: MappingRow[];
    existingFile?: File | null;
};

export default function MappingUploadPage({ onMappingsConfirmed, existingRows, existingFile }: Props) {
    const [file, setFile] = useState<File | null>(existingFile || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedRows, setExtractedRows] = useState<MappingRow[]>(existingRows || []);
    const [showReview, setShowReview] = useState(existingRows && existingRows.length > 0);
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();

    // Update state if existing props change (e.g., navigating back)
    useEffect(() => {
        if (existingRows && existingRows.length > 0) {
            setExtractedRows(existingRows);
            setShowReview(true);
        }
        if (existingFile) {
            setFile(existingFile);
        }
    }, [existingRows, existingFile]);

    const handleExtract = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        try {
            const result = await extractMappingTable(file);
            if (!result.rows || result.rows.length === 0) {
                setError("No mapping table found in the PDF.");
                return;
            }
            const rows: MappingRow[] = result.rows.map((row) => ({
                id: crypto.randomUUID(),
                ...row,
                confirmed: true,
            }));
            setExtractedRows(rows);
            setShowReview(true);
        } catch (err: any) {
            setError(err.message || "Extraction failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleRowChange = (id: string, field: keyof MappingRow, value: string | boolean) => {
        // Special handling when changing matching_type to 1:1 - convert all group rows to 1:1
        if (field === "matching_type" && value === "1:1") {
            const row = extractedRows.find((r) => r.id === id);
            if (row && row.group_id !== "none") {
                // Convert all rows in this group to 1:1 with no group
                setExtractedRows((prev) =>
                    prev.map((r) => r.group_id === row.group_id
                        ? { ...r, matching_type: "1:1", group_id: "none" }
                        : r
                    )
                );
                return;
            }
        }
        setExtractedRows((prev) =>
            prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    const handleDeleteRow = (id: string) => {
        setExtractedRows((prev) => prev.filter((row) => row.id !== id));
    };

    const handleAddRow = () => {
        const newRow: MappingRow = {
            id: crypto.randomUUID(),
            source_course_no: "",
            source_course_name: "",
            source_credits: "",
            source_grade: "",
            tum_module_nr: "",
            tum_module_title: "",
            tum_ects: "",
            matching_type: "1:1",
            group_id: "none",
            confirmed: true,
        };
        setExtractedRows((prev) => [...prev, newRow]);
    };

    // Add a subrow to existing group or create new group
    const handleAddSubrow = (parentId: string) => {
        const parentRow = extractedRows.find((r) => r.id === parentId);
        if (!parentRow) return;

        // Generate new group_id if parent doesn't have one yet
        const newGroupId = parentRow.group_id !== "none" ? parentRow.group_id : `group_${Date.now()}`;

        // Update parent to have group_id if it didn't
        const newRow: MappingRow = {
            id: crypto.randomUUID(),
            // For n:1: copy TUM info, empty source
            source_course_no: parentRow.matching_type === "n:1" ? "" : parentRow.source_course_no,
            source_course_name: parentRow.matching_type === "n:1" ? "" : parentRow.source_course_name,
            source_credits: parentRow.matching_type === "n:1" ? "" : parentRow.source_credits,
            source_grade: parentRow.matching_type === "n:1" ? "" : parentRow.source_grade,
            // For 1:n: copy source info, empty TUM
            tum_module_nr: parentRow.matching_type === "1:n" ? "" : parentRow.tum_module_nr,
            tum_module_title: parentRow.matching_type === "1:n" ? "" : parentRow.tum_module_title,
            tum_ects: parentRow.matching_type === "1:n" ? "" : parentRow.tum_ects,
            matching_type: parentRow.matching_type,
            group_id: newGroupId,
            confirmed: true,
        };

        // Find index of parent row and insert after it
        const parentIndex = extractedRows.findIndex((r) => r.id === parentId);
        setExtractedRows((prev) => {
            const updated = [...prev];
            // Update parent group_id if needed
            if (prev[parentIndex].group_id === "none") {
                updated[parentIndex] = { ...prev[parentIndex], group_id: newGroupId };
            }
            // Insert new row after all rows with same group
            let insertIndex = parentIndex + 1;
            while (insertIndex < updated.length && updated[insertIndex].group_id === newGroupId) {
                insertIndex++;
            }
            updated.splice(insertIndex, 0, newRow);
            return updated;
        });
    };

    const handleConfirm = () => {
        const confirmedRows = extractedRows.filter((row) => row.confirmed);
        if (confirmedRows.length === 0) {
            alert("Please confirm at least one mapping.");
            return;
        }
        onMappingsConfirmed(file!, confirmedRows);
        navigate("/catalogue");
    };

    const handleManualEntry = () => {
        setExtractedRows([]);
        setShowReview(true);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
        }
    };

    // Review/Edit View
    if (showReview) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Review Extracted Mappings</h1>
                    <p style={styles.subtitle}>
                        Review and edit the extracted mappings. Uncheck rows you want to exclude.
                    </p>
                </div>

                {extractedRows.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                        <p style={{ marginBottom: 16 }}>No mappings yet. Add rows manually.</p>
                        <button onClick={handleAddRow} style={styles.primaryBtn}>
                            ➕ Add Row
                        </button>
                    </div>
                ) : (
                    <div style={styles.card}>
                        <div style={{ overflowX: "auto" }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>✓</th>
                                        <th style={styles.th}>Source Course No</th>
                                        <th style={styles.th}>Source Course Name</th>
                                        <th style={styles.th}>Credits</th>
                                        <th style={styles.th}>Grade</th>
                                        <th style={styles.th}>Type</th>
                                        <th style={styles.th}>TUM Module Nr</th>
                                        <th style={styles.th}>TUM Module Title</th>
                                        <th style={styles.th}>ECTS</th>
                                        <th style={styles.th}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        // Pre-calculate group info
                                        const groupInfo: { [groupId: string]: { count: number; firstIndex: number; type: string } } = {};
                                        extractedRows.forEach((r, idx) => {
                                            if (r.group_id !== "none") {
                                                if (!groupInfo[r.group_id]) {
                                                    groupInfo[r.group_id] = { count: 0, firstIndex: idx, type: r.matching_type };
                                                }
                                                groupInfo[r.group_id].count++;
                                            }
                                        });

                                        // Generate colors for groups - different palettes for n:1 and 1:n
                                        const groupColors: { [key: string]: string } = {};
                                        // Blue tones for n:1 (multiple source → one TUM)
                                        const n1Colors = ["#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a"];
                                        // Amber/orange tones for 1:n (one source → multiple TUM)
                                        const oneNColors = ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f"];
                                        let n1Index = 0;
                                        let oneNIndex = 0;
                                        Object.keys(groupInfo).forEach((gid) => {
                                            const gType = groupInfo[gid].type;
                                            if (gType === "n:1") {
                                                groupColors[gid] = n1Colors[n1Index % n1Colors.length];
                                                n1Index++;
                                            } else {
                                                groupColors[gid] = oneNColors[oneNIndex % oneNColors.length];
                                                oneNIndex++;
                                            }
                                        });

                                        return extractedRows.map((row, index) => {
                                            const isGrouped = row.group_id !== "none";
                                            const info = isGrouped ? groupInfo[row.group_id] : null;
                                            const isFirstInGroup = info && info.firstIndex === index;
                                            const groupColor = isGrouped ? groupColors[row.group_id] : undefined;

                                            // For n:1: TUM side spans (first row shows TUM, others skip)
                                            // For 1:n: Source side spans (first row shows Source, others skip)
                                            const showTumCells = !isGrouped || row.matching_type !== "n:1" || isFirstInGroup;
                                            const showSourceCells = !isGrouped || row.matching_type !== "1:n" || isFirstInGroup;
                                            const rowSpanCount = info?.count || 1;

                                            return (
                                                <tr
                                                    key={row.id}
                                                    style={{
                                                        opacity: row.confirmed ? 1 : 0.4,
                                                        background: isGrouped ? `${groupColor}08` : undefined,
                                                        borderLeft: isGrouped ? `4px solid ${groupColor}` : undefined,
                                                    }}
                                                >
                                                    <td style={styles.td}>
                                                        <input
                                                            type="checkbox"
                                                            checked={row.confirmed}
                                                            onChange={(e) => handleRowChange(row.id, "confirmed", e.target.checked)}
                                                            style={styles.checkbox}
                                                        />
                                                    </td>

                                                    {/* Source columns - rowSpan for 1:n (one source → multiple TUM) */}
                                                    {showSourceCells && (
                                                        <>
                                                            <td style={{ ...styles.td, verticalAlign: "middle" }} rowSpan={row.matching_type === "1:n" && isFirstInGroup ? rowSpanCount : undefined}>
                                                                <input type="text" value={row.source_course_no} onChange={(e) => handleRowChange(row.id, "source_course_no", e.target.value)} style={styles.input} />
                                                            </td>
                                                            <td style={{ ...styles.td, verticalAlign: "middle" }} rowSpan={row.matching_type === "1:n" && isFirstInGroup ? rowSpanCount : undefined}>
                                                                <input type="text" value={row.source_course_name} onChange={(e) => handleRowChange(row.id, "source_course_name", e.target.value)} style={{ ...styles.input, minWidth: 180 }} />
                                                            </td>
                                                            <td style={{ ...styles.td, verticalAlign: "middle" }} rowSpan={row.matching_type === "1:n" && isFirstInGroup ? rowSpanCount : undefined}>
                                                                <input type="text" value={row.source_credits} onChange={(e) => handleRowChange(row.id, "source_credits", e.target.value)} style={{ ...styles.input, width: 60 }} />
                                                            </td>
                                                            <td style={{ ...styles.td, verticalAlign: "middle" }} rowSpan={row.matching_type === "1:n" && isFirstInGroup ? rowSpanCount : undefined}>
                                                                <input type="text" value={row.source_grade} onChange={(e) => handleRowChange(row.id, "source_grade", e.target.value)} style={{ ...styles.input, width: 60 }} />
                                                            </td>
                                                        </>
                                                    )}
                                                    {/* Type column - spans for groups, only shown on first row */}
                                                    {(!isGrouped || isFirstInGroup) && (
                                                        <td style={{ ...styles.td, verticalAlign: "middle", textAlign: "center" }} rowSpan={isGrouped ? rowSpanCount : undefined}>
                                                            <select
                                                                value={row.matching_type}
                                                                onChange={(e) => handleRowChange(row.id, "matching_type", e.target.value)}
                                                                style={{
                                                                    ...styles.input,
                                                                    width: 65,
                                                                    padding: "4px 6px",
                                                                    background: row.matching_type === "1:1" ? "#f3f4f6" : row.matching_type === "n:1" ? "#dbeafe" : "#fef3c7",
                                                                    color: row.matching_type === "1:1" ? "#374151" : row.matching_type === "n:1" ? "#1d4ed8" : "#92400e",
                                                                    fontWeight: 600,
                                                                    fontSize: 12,
                                                                }}
                                                            >
                                                                <option value="1:1">1:1</option>
                                                                <option value="n:1">n:1</option>
                                                                <option value="1:n">1:n</option>
                                                            </select>
                                                            {row.matching_type !== "1:1" && (
                                                                <button
                                                                    onClick={() => handleAddSubrow(row.id)}
                                                                    style={{ ...styles.addSubrowBtn, marginTop: 6 }}
                                                                    title="Add another row to this group"
                                                                >
                                                                    ➕
                                                                </button>
                                                            )}
                                                        </td>
                                                    )}

                                                    {/* TUM columns - rowSpan for n:1 (multiple source → one TUM) */}
                                                    {showTumCells && (
                                                        <>
                                                            <td style={{ ...styles.td, verticalAlign: "middle" }} rowSpan={row.matching_type === "n:1" && isFirstInGroup ? rowSpanCount : undefined}>
                                                                <input type="text" value={row.tum_module_nr} onChange={(e) => handleRowChange(row.id, "tum_module_nr", e.target.value)} style={styles.input} />
                                                            </td>
                                                            <td style={{ ...styles.td, verticalAlign: "middle" }} rowSpan={row.matching_type === "n:1" && isFirstInGroup ? rowSpanCount : undefined}>
                                                                <input type="text" value={row.tum_module_title} onChange={(e) => handleRowChange(row.id, "tum_module_title", e.target.value)} style={{ ...styles.input, minWidth: 180 }} />
                                                            </td>
                                                            <td style={{ ...styles.td, verticalAlign: "middle" }} rowSpan={row.matching_type === "n:1" && isFirstInGroup ? rowSpanCount : undefined}>
                                                                <input type="text" value={row.tum_ects} onChange={(e) => handleRowChange(row.id, "tum_ects", e.target.value)} style={{ ...styles.input, width: 60 }} />
                                                            </td>
                                                        </>
                                                    )}

                                                    <td style={styles.td}>
                                                        <button onClick={() => handleDeleteRow(row.id)} style={styles.deleteBtn}>🗑️</button>
                                                    </td>
                                                </tr>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>

                        <div style={styles.actions}>
                            <button onClick={handleAddRow} style={styles.secondaryBtn}>➕ Add Row</button>
                            <button onClick={() => setShowReview(false)} style={styles.secondaryBtn}>← Back</button>
                            <button onClick={handleConfirm} style={styles.primaryBtn}>Confirm & Continue →</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Upload View
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>TUM Credit Recognition</h1>
                <p style={styles.subtitle}>Upload your recognition mapping table PDF to get started</p>
            </div>

            <div style={styles.card}>
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    style={{
                        ...styles.dropZone,
                        borderColor: dragActive ? "#3b82f6" : file ? "#22c55e" : "#d1d5db",
                        background: dragActive ? "#eff6ff" : file ? "#f0fdf4" : "#fafafa",
                    }}
                >
                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => {
                            setFile(e.target.files?.[0] || null);
                            setError(null);
                        }}
                        style={{ display: "none" }}
                        id="file-upload"
                    />
                    <label htmlFor="file-upload" style={{ cursor: "pointer", textAlign: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>{file ? "📄" : "📤"}</div>
                        {file ? (
                            <p style={{ color: "#16a34a", fontWeight: 600 }}>{file.name}</p>
                        ) : (
                            <>
                                <p style={{ fontWeight: 500, color: "#374151" }}>Drop your PDF here or click to browse</p>
                                <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 8 }}>PDF with mapping table (source → TUM courses)</p>
                            </>
                        )}
                    </label>
                </div>

                {/* Loading Overlay */}
                {loading && (
                    <div style={styles.loadingOverlay}>
                        <div style={styles.loadingSpinner}>🔄</div>
                        <div style={styles.loadingTitle}>Extracting mappings from PDF...</div>
                        <div style={styles.loadingText}>This may take a minute or two depending on the file size.</div>
                        <div style={styles.loadingText}>Please wait, don't close this page.</div>
                    </div>
                )}

                {error && (
                    <div style={styles.error}>{error}</div>
                )}

                <div style={styles.actions}>
                    <button
                        onClick={handleExtract}
                        disabled={!file || loading}
                        style={{
                            ...styles.primaryBtn,
                            opacity: file && !loading ? 1 : 0.5,
                            cursor: file && !loading ? "pointer" : "not-allowed",
                        }}
                    >
                        {loading ? (
                            <>
                                <span style={styles.spinner}></span>
                                Extracting...
                            </>
                        ) : (
                            "🔍 Extract Mappings"
                        )}
                    </button>

                    <button onClick={handleManualEntry} disabled={loading} style={styles.secondaryBtn}>
                        ✏️ Enter Manually
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: "40px",
        maxWidth: 1400,
        margin: "0 auto",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    header: {
        marginBottom: 32,
    },
    title: {
        fontSize: 32,
        fontWeight: 700,
        color: "#111827",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: "#6b7280",
    },
    card: {
        background: "#ffffff",
        borderRadius: 16,
        padding: 32,
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        border: "1px solid #e5e7eb",
    },
    dropZone: {
        border: "2px dashed #d1d5db",
        borderRadius: 12,
        padding: "48px 32px",
        textAlign: "center" as const,
        transition: "all 0.2s ease",
        marginBottom: 24,
    },
    actions: {
        display: "flex",
        gap: 12,
        marginTop: 24,
        flexWrap: "wrap" as const,
    },
    primaryBtn: {
        padding: "12px 24px",
        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        gap: 8,
        boxShadow: "0 4px 6px -1px rgb(59 130 246 / 0.4)",
        transition: "transform 0.1s, box-shadow 0.1s",
    },
    secondaryBtn: {
        padding: "12px 24px",
        background: "#fff",
        color: "#374151",
        border: "1px solid #d1d5db",
        borderRadius: 8,
        cursor: "pointer",
        fontSize: 15,
        fontWeight: 500,
        transition: "background 0.1s",
    },
    deleteBtn: {
        background: "#fee2e2",
        color: "#dc2626",
        border: "none",
        borderRadius: 6,
        padding: "6px 10px",
        cursor: "pointer",
        fontSize: 14,
    },
    error: {
        padding: 16,
        background: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: 8,
        color: "#dc2626",
        marginBottom: 16,
    },
    emptyState: {
        textAlign: "center" as const,
        padding: 64,
        background: "#f9fafb",
        borderRadius: 12,
        color: "#6b7280",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as const,
        fontSize: 14,
    },
    th: {
        padding: "12px 8px",
        textAlign: "left" as const,
        borderBottom: "2px solid #e5e7eb",
        fontWeight: 600,
        color: "#374151",
        background: "#f9fafb",
        whiteSpace: "nowrap" as const,
    },
    td: {
        padding: "10px 8px",
        borderBottom: "1px solid #f3f4f6",
        verticalAlign: "middle" as const,
    },
    input: {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        fontSize: 14,
        transition: "border-color 0.1s",
        outline: "none",
    },
    checkbox: {
        width: 18,
        height: 18,
        cursor: "pointer",
    },
    spinner: {
        width: 16,
        height: 16,
        border: "2px solid #fff",
        borderTopColor: "transparent",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
    },
    addSubrowBtn: {
        display: "block",
        background: "#dbeafe",
        color: "#1d4ed8",
        border: "1px solid #93c5fd",
        borderRadius: 6,
        padding: "4px 8px",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        transition: "background 0.1s",
    },
    loadingOverlay: { padding: 32, background: "linear-gradient(135deg, #eff6ff, #dbeafe)", borderRadius: 16, textAlign: "center" as const, marginBottom: 24, border: "1px solid #93c5fd" },
    loadingSpinner: { fontSize: 48, marginBottom: 16 },
    loadingTitle: { fontSize: 18, fontWeight: 600, color: "#1e40af", marginBottom: 8 },
    loadingText: { fontSize: 14, color: "#6b7280", marginTop: 4 },
};
