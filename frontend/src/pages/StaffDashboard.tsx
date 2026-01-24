import { Routes, Route, Navigate, useParams } from "react-router-dom";
import AnalyticsPage from "./AnalyticsPage";

import ApplicationsPage from "./ApplicationsPage";
import TasksPage from "./TasksPage";
import TaskDetailPage from "./TaskDetailPage";
import KanbanPage from "./KanbanPage";
import TestingPage from "./TestingPage";
import { mockApplications } from "../data/mockApplications";
import { mockAnalyticsData } from "../data/mockAnalyticsData";

// Wrapper to inject data based on ID
const ApplicationDetail = () => {
    const { id } = useParams();
    // In a real app, fetch by ID. Here we find in mock data
    const app = mockApplications.find(a => a.id === id);
    const data = app ? app.analyticsData : mockAnalyticsData; // Fallback to default mock if not found

    return <AnalyticsPage data={data} isLoading={false} />;
};

export default function StaffDashboard() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="applications" replace />} />
            <Route path="dashboard" element={<Navigate to="applications" replace />} />

            <Route path="applications" element={<ApplicationsPage />} />
            <Route path="kanban" element={<KanbanPage />} />
            <Route path="testing" element={<TestingPage />} />

            <Route path="applications/:id" element={<ApplicationDetail />} />

            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/:taskId" element={<TaskDetailPage />} />

            <Route path="*" element={<Navigate to="applications" replace />} />
        </Routes>
    );
}
