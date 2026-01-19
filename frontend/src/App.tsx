import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SideMenu from "./components/SideMenu";
import PersonalDataPage from "./pages/PersonalDataPage";
import MappingUploadPage from "./pages/MappingUploadPage";
import CatalogueUploadPage from "./pages/CatalogueUploadPage";
import FinalReviewPage from "./pages/FinalReviewPage";
import HealthCheck from "./components/HealthCheck";
import { useState } from "react";
import { TUMModuleMapping, PersonalData, emptyPersonalData } from "./types";
import { ErrorBoundary } from "./utils/debug";

export default function App() {
  const [personalData, setPersonalData] = useState<PersonalData>(emptyPersonalData);
  const [mappingFile, setMappingFile] = useState<File | null>(null);
  const [tumModules, setTumModules] = useState<TUMModuleMapping[]>([]);

  const handlePersonalDataConfirmed = (data: PersonalData) => {
    setPersonalData(data);
  };

  const handleMappingsConfirmed = (file: File | null, modules: TUMModuleMapping[]) => {
    setMappingFile(file);
    setTumModules(modules);
  };

  const handleContentConfirmed = (updatedModules: TUMModuleMapping[]) => {
    setTumModules(updatedModules);
  };

  const handleSubmit = () => {
    // Prepare data for submission
    const submissionData = {
      personalData,
      mappingFile: mappingFile?.name,
      tum_modules: tumModules.map((mod) => ({
        tum_module_nr: mod.tum_module_nr,
        tum_module_title: mod.tum_module_title,
        tum_ects: mod.tum_ects,
        catalogue_content: mod.catalogue_content,
        source_courses: mod.source_courses.map((sc) => ({
          source_course_no: sc.source_course_no,
          source_course_name: sc.source_course_name,
          source_credits: sc.source_credits,
          source_grade: sc.source_grade,
        })),
      })),
    };

    console.log("📤 Submitting to TUM staff:", submissionData);

    // TODO: Send to backend API
    // await axios.post(`${API_URL}/submit`, submissionData);

    alert("Data successfully sent to TUM staff!");

    // Reset state
    setPersonalData(emptyPersonalData);
    setMappingFile(null);
    setTumModules([]);
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SideMenu />
        <div style={{ marginLeft: "240px" }}>
          <Routes>
            {/* Step 0: Personal Data Form */}
            <Route
              path="/"
              element={
                <PersonalDataPage
                  onDataConfirmed={handlePersonalDataConfirmed}
                  existingData={personalData}
                />
              }
            />

            {/* Step 1: Upload mapping table */}
            <Route
              path="/mapping"
              element={
                personalData.firstName ? (
                  <MappingUploadPage
                    onMappingsConfirmed={handleMappingsConfirmed}
                    existingModules={tumModules}
                    existingFile={mappingFile}
                  />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            {/* Step 2: Upload catalogues */}
            <Route
              path="/catalogue"
              element={
                tumModules.length > 0 ? (
                  <CatalogueUploadPage
                    tumModules={tumModules}
                    onContentConfirmed={handleContentConfirmed}
                  />
                ) : (
                  <Navigate to="/mapping" replace />
                )
              }
            />

            {/* Step 3: Final review */}
            <Route
              path="/review"
              element={
                tumModules.length > 0 ? (
                  <FinalReviewPage
                    personalData={personalData}
                    onPersonalDataChange={setPersonalData}
                    mappingFile={mappingFile}
                    tumModules={tumModules}
                    onSubmit={handleSubmit}
                  />
                ) : (
                  <Navigate to="/mapping" replace />
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