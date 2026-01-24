
import { mockApplications } from './mockApplications';
import { ModuleAnalysisResult } from '../types/analyticsTypes';

// Type for a flattened task item (compatible with TasksPage view)
export interface TaskItem {
    id: string; // unique task identifier
    studentName: string;
    university: string;
    tumModuleNr: string;
    tumModuleTitle: string;
    tumEcts: string;
    score: number;
    decision: string;
    status: string;
    // For manual tests
    isManualTest?: boolean;
    result?: ModuleAnalysisResult;
}

const STORAGE_KEY = 'tum_assistant_custom_tasks';

export const getTasks = (): TaskItem[] => {
    // 1. Get Mock Tasks (flattened)
    const mockTasks: TaskItem[] = mockApplications.flatMap(app =>
        app.analyticsData.moduleResults.map(result => ({
            id: `${app.id}-${result.tumModuleNr}`,
            studentName: app.studentName,
            university: app.university,
            tumModuleNr: result.tumModuleNr,
            tumModuleTitle: result.tumModuleTitle,
            tumEcts: result.tumEcts,
            score: result.overallScore,
            decision: result.decisionHint,
            status: app.status,
            result: result // Store full result for detail view
        }))
    );

    // 2. Get Custom Manual Tasks from LocalStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    const customTasks: TaskItem[] = stored ? JSON.parse(stored) : [];

    return [...customTasks, ...mockTasks];
};

// Simplified: find by single ID
export const getTaskById = (id: string): TaskItem | undefined => {
    const tasks = getTasks();
    return tasks.find(t => t.id === id);
};

export const addManualTask = (result: ModuleAnalysisResult) => {
    const newId = `task-${Date.now()}`;
    const newTask: TaskItem = {
        id: newId,
        studentName: "Test User",
        university: "Testing Playground",
        tumModuleNr: result.tumModuleNr,
        tumModuleTitle: result.tumModuleTitle,
        tumEcts: result.tumEcts,
        score: result.overallScore,
        decision: result.decisionHint,
        status: 'pending',
        isManualTest: true,
        result: result
    };

    const stored = localStorage.getItem(STORAGE_KEY);
    const customTasks: TaskItem[] = stored ? JSON.parse(stored) : [];

    customTasks.unshift(newTask); // Add to top
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customTasks));

    return newTask;
};

export const clearCustomTasks = () => {
    localStorage.removeItem(STORAGE_KEY);
};
