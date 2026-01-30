import { Routes, Route, Navigate, useParams } from "react-router-dom";
import AnalyticsPage from "./AnalyticsPage";
import TasksPage from "./TasksPage";
import TaskDetailPage from "./TaskDetailPage";
import KanbanPage from "./KanbanPage";
import TestingPage from "./TestingPage";
import { mockAnalyticsData } from "../data/mockAnalyticsData";

// Wrapper to inject data based on task ID
const TaskAnalyticsDetail = () => {
    const { } = useParams();
    // In a real app, fetch analytics by task ID
    // For now, use default mock data
    return <AnalyticsPage data={mockAnalyticsData} isLoading={false} />;
};

export default function StaffDashboard() {
    return (
        <Routes>
            {/* Default route goes to tasks list */}
            <Route path="/" element={<Navigate to="tasks" replace />} />
            <Route path="dashboard" element={<Navigate to="tasks" replace />} />

            {/* Task management - shows both submissions and manual tests */}
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/:taskId" element={<TaskDetailPage />} />
            <Route path="tasks/:taskId/analytics" element={<TaskAnalyticsDetail />} />

            {/* Other dashboard views */}
            <Route path="kanban" element={<KanbanPage />} />
            <Route path="testing" element={<TestingPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="tasks" replace />} />
        </Routes>
    );
}
