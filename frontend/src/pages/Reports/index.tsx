import { useState, useEffect } from "react";
import {
  MatchScoreChart,
  ReportPreview,
  PDFExportButton,
  DataSummaryPanel,
  MatchScoreData,
  ReportDataSummary,
} from "../../components/reporting";
import tumLogo from "../../assets/tum-logo.svg";

export default function ReportsPage() {
  const [matchData, setMatchData] = useState<MatchScoreData[]>([]);
  const [summaryData, setSummaryData] = useState<ReportDataSummary>({
    totalCourses: 0,
    avgScore: 0,
    highestScore: 0,
    lowestScore: 0,
  });
  const [reportHtml, setReportHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch report data from backend
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call to backend
        // const response = await fetch("http://localhost:8000/api/reports");
        // const data = await response.json();
        
        // Mock data for now - remove this when backend is ready
        const mockData: MatchScoreData[] = [
          { module: "CS101", score: 85 },
          { module: "CS102", score: 92 },
          { module: "CS103", score: 78 },
          { module: "CS104", score: 88 },
        ];
        
        setMatchData(mockData);
        setSummaryData({
          totalCourses: mockData.length,
          avgScore: Math.round(mockData.reduce((sum, d) => sum + d.score, 0) / mockData.length),
          highestScore: Math.max(...mockData.map(d => d.score)),
          lowestScore: Math.min(...mockData.map(d => d.score)),
        });
        
        setReportHtml("<p>Sample report content - will be replaced with actual report HTML</p>");
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleExportPDF = async () => {
    try {
      // TODO: Replace with actual API call to backend PDF export
      console.log("Exporting PDF...");
      // const response = await fetch("http://localhost:8000/api/reports/export-pdf");
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const a = document.createElement("a");
      // a.href = url;
      // a.download = "report.pdf";
      // a.click();
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <img src={tumLogo} alt="TUM Logo" style={styles.logo} />
        <h1 style={styles.title}>Course Matching Reports</h1>
      </header>

      {/* MAIN CONTENT */}
      <div style={styles.content}>
        {loading ? (
          <p style={styles.loadingText}>Loading report data...</p>
        ) : (
          <div style={styles.grid}>
            {/* Summary Panel */}
            <div style={styles.fullWidth}>
              <DataSummaryPanel summary={summaryData} />
            </div>

            {/* Match Score Chart */}
            <div style={styles.fullWidth}>
              <MatchScoreChart data={matchData} />
            </div>

            {/* Report Preview */}
            <div style={styles.fullWidth}>
              <ReportPreview html={reportHtml} />
            </div>

            {/* Export Button */}
            <div style={styles.buttonContainer}>
              <PDFExportButton onExport={handleExportPDF} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    minHeight: "100vh",
    backgroundColor: "#f5f5f5",
  },
  header: {
    display: "flex",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#0051a2",
    color: "#fff",
    gap: "10px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  logo: {
    height: "40px",
  },
  title: {
    fontSize: "20px",
    margin: 0,
    fontWeight: "bold" as const,
  },
  content: {
    flex: 1,
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
  },
  grid: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px",
  },
  fullWidth: {
    width: "100%",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "20px",
  },
  loadingText: {
    textAlign: "center" as const,
    fontSize: "16px",
    color: "#666",
    padding: "40px",
  },
};
