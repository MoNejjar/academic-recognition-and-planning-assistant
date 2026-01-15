import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SideMenu from "./components/SideMenu";
import ReviewPage from "./pages/ReviewPage";
import HomePage from "./pages/HomePage";
import HealthCheck from "./components/HealthCheck";
import { useState } from "react";
import { Course } from "./types";
import { ErrorBoundary } from "./utils/debug";

export default function App() {
  const [tumFile, setTumFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  const handleCoursesLoaded = (file: File | null, loadedCourses: Course[]) => {
    setTumFile(file);
    setCourses(loadedCourses);
  };

  const handleSubmit = () => {
    // Préparer les données à envoyer au staff
    const submissionData = {
      tumFile: tumFile?.name,
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        sourceUniversity: course.sourceUniversity,
        credits: course.credits,
        description: course.description,
        initialParsedData: course.initialParsedData,
        catalogues: course.catalogues.map((cat) => ({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          fileName: cat.file?.name,
          manualText: cat.manualText,
          parsedLLM: cat.parsedLLM,
        })),
      })),
    };

    console.log("Data to submit to TUM staff:", submissionData);
    
    // TODO: Send to your backend API
    // await axios.post(`${API_URL}/submit`, submissionData);
    
    alert("Data successfully sent to TUM staff!");
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SideMenu />
        <div style={{ marginLeft: "240px" }}>
          <Routes>
            <Route 
              path="/" 
              element={<HomePage onCoursesLoaded={handleCoursesLoaded} />} 
            />
            <Route
              path="/review"
              element={
                <ReviewPage
                  tumFile={tumFile}
                  courses={courses}
                  setCourses={setCourses}
                  onSubmit={handleSubmit}
                />
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