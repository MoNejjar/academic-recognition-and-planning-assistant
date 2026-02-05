import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/StudentDashboard";
import StaffDashboard from "./pages/StaffDashboard";
import Layout from "./components/layout/Layout";
import { ErrorBoundary } from "./utils/debug";
import FloatingChat from "./components/chatbot/FloatingChat";
import { UserProvider } from "./context/UserContext";

function ConditionalFloatingChat() {
  const location = useLocation();
  const isStudentPage = location.pathname.startsWith("/student");
  
  if (!isStudentPage) return null;
  return <FloatingChat />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />

            {/* Student Routes */}
            <Route path="/student/*" element={<StudentDashboard />} />

            {/* Staff Routes - Wrapped in Layout */}
            <Route path="/staff/*" element={<Layout />}>
              <Route path="*" element={<StaffDashboard />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ConditionalFloatingChat />
        </BrowserRouter>
      </UserProvider>
    </ErrorBoundary>
  );
}
