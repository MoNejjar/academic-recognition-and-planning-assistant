import { Routes, Route, Navigate, useParams } from "react-router-dom";
import AnalyticsPage from "./AnalyticsPage";
import TasksPage from "./TasksPage";
import TaskDetailPageModern from "./TaskDetailPageModern";
import KanbanPage from "./KanbanPage";
import TestingPage from "./TestingPage";
import ArchivePage from "./ArchivePage";
import SubmissionDetailPage from "./SubmissionDetailPage";
import { useState, useEffect } from "react";
import { getTaskDetail } from "../data/taskManager";

import { AnalyticsResponse } from "../types/analyticsTypes";

// Wrapper to inject data based on task ID
const TaskAnalyticsDetail = () => {
    const { taskId } = useParams();
    const [data, setData] = useState<AnalyticsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (taskId) {
            setIsLoading(true);
            getTaskDetail(taskId).then(task => {
                if (task?.result) {
                    // Convert task result to analytics format
                    setData({
                        moduleResults: [task.result],
                        totalModulesAnalyzed: 1,
                        modulesHighlyEquivalent: task.result.decisionHint === 'highly_equivalent' ? 1 : 0,
                        modulesPartial: task.result.decisionHint === 'partial' ? 1 : 0,
                        modulesInsufficient: task.result.decisionHint === 'insufficient' ? 1 : 0,
                        averageScore: task.result.overallScore,
                        analysisTimestamp: new Date().toISOString(),
                        llmModelUsed: "AI Assistant"
                    });
                }
                setIsLoading(false);
            });
        }
    }, [taskId]);

    return <AnalyticsPage data={data} isLoading={isLoading} />;
};

export default function StaffDashboard() {
    return (
        <Routes>
            {/* Default route goes to tasks list */}
            <Route path="/" element={<Navigate to="tasks" replace />} />
            <Route path="dashboard" element={<Navigate to="tasks" replace />} />

            {/* Task management - shows both submissions and manual tests */}
            <Route path="tasks" element={<TasksPage />} />
            <Route path="tasks/:taskId" element={<TaskDetailPageModern />} />
            <Route path="tasks/:taskId/analytics" element={<TaskAnalyticsDetail />} />

            {/* Archive - searchable list of tasks and submissions */}
            <Route path="archive" element={<ArchivePage />} />

            {/* Submission details - view individual submission with all modules */}
            <Route path="submissions/:submissionId" element={<SubmissionDetailPage />} />

            {/* Other dashboard views */}
            <Route path="kanban" element={<KanbanPage />} />
            <Route path="testing" element={<TestingPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="tasks" replace />} />
        </Routes>
    );
}
