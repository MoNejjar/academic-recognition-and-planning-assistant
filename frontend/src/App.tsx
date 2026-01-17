import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SideMenu from "./components/SideMenu";
import MappingUploadPage from "./pages/MappingUploadPage";
import CatalogueUploadPage from "./pages/CatalogueUploadPage";
import FinalReviewPage from "./pages/FinalReviewPage";
import HealthCheck from "./components/HealthCheck";
import { useState } from "react";
import { MappingRow } from "./types";
import { ErrorBoundary } from "./utils/debug";

export default function App() {
  const [mappingFile, setMappingFile] = useState<File | null>(null);
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([]);

  const handleMappingsConfirmed = (file: File, rows: MappingRow[]) => {
    setMappingFile(file);
    setMappingRows(rows);
  };

  const handleContentConfirmed = (updatedRows: MappingRow[]) => {
    setMappingRows(updatedRows);
  };

  const handleSubmit = () => {
    // Prepare data for submission
    const submissionData = {
      mappingFile: mappingFile?.name,
      mappings: mappingRows.map((row) => ({
        source_course_no: row.source_course_no,
        source_course_name: row.source_course_name,
        source_credits: row.source_credits,
        source_grade: row.source_grade,
        tum_module_nr: row.tum_module_nr,
        tum_module_title: row.tum_module_title,
        tum_ects: row.tum_ects,
        catalogue_content: row.catalogue_content,
      })),
    };

    console.log("📤 Submitting to TUM staff:", submissionData);

    // TODO: Send to backend API
    // await axios.post(`${API_URL}/submit`, submissionData);

    alert("Data successfully sent to TUM staff!");

    // Reset state
    setMappingFile(null);
    setMappingRows([]);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SideMenu />
        <div style={{ marginLeft: "240px" }}>
          <Routes>
            {/* Step 1: Upload mapping table */}
            <Route
              path="/"
              element={
                <MappingUploadPage
                  onMappingsConfirmed={handleMappingsConfirmed}
                  existingRows={mappingRows}
                  existingFile={mappingFile}
                />
              }
            />

            {/* Step 2: Upload catalogues */}
            <Route
              path="/catalogue"
              element={
                mappingRows.length > 0 ? (
                  <CatalogueUploadPage
                    mappingRows={mappingRows}
                    onContentConfirmed={handleContentConfirmed}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Step 3: Final review */}
            <Route
              path="/review"
              element={
                mappingRows.length > 0 ? (
                  <FinalReviewPage
                    mappingFile={mappingFile}
                    mappingRows={mappingRows}
                    onSubmit={handleSubmit}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <HealthCheck />
      </BrowserRouter>
    </ErrorBoundary>
  );
}