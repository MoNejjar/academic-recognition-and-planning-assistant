import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SideMenuLayout from "./layout/SideMenuLayout";

import UploadPage from "./pages/CourseMatching/PDFUploadPage";
import FormPage from "./pages/CourseMatching/FormPage";
import ReviewPage from "./pages/CourseMatching/ReviewPage";
import SubmitPage from "./pages/CourseMatching/SubmitPage";
import CoursePage from "./pages/CourseMatching/CoursePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirection racine */}
        <Route path="/" element={<Navigate to="/upload" replace />} />

        {/* Layout avec menu */}
        <Route element={<SideMenuLayout />}>
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/course" element={<CoursePage />} />
        </Route>

        {/* Fallback optionnel */}
        <Route path="*" element={<Navigate to="/upload" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
