
import { ModuleAnalysisResult } from '../types/analyticsTypes';
import { snakeToCamel } from '../utils/caseConversion';

// Type for a flattened task item (compatible with TasksPage view)
export interface TaskItem {
    id: string; // unique task identifier
    studentName: string;
    matriculationNumber: string;
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
    // For real submissions
    submissionId?: string;
    submissionDate?: string;
    createdAt?: string;
    decisionDate?: string; // Date when task was approved/rejected
}

const STORAGE_KEY = 'tum_assistant_custom_tasks';

/**
 * Fetch tasks directly from backend API
 */
const fetchTasksFromBackend = async (): Promise<TaskItem[]> => {
    try {
        const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/tasks/tasks`);
        
        if (!response.ok) {
            console.error('Failed to fetch tasks');
            return [];
        }
        
        const data = await response.json();
        
        // Tasks are already in the correct format from backend
        return data.tasks || [];
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
};

/**
 * Get all tasks: real tasks from backend + manual test tasks from localStorage
 */
export const getTasks = async (): Promise<TaskItem[]> => {
    // Get manual test tasks from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    const customTasks: TaskItem[] = stored ? JSON.parse(stored) : [];
    
    // Get real tasks from backend
    const backendTasks = await fetchTasksFromBackend();
    
    // Merge both sources (backend tasks first, then manual tests)
    return [...backendTasks, ...customTasks];
};

/**
 * Synchronous version that only returns localStorage tasks
 * Use this when async is not possible
 */
export const getTasksSync = (): TaskItem[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const customTasks: TaskItem[] = stored ? JSON.parse(stored) : [];
    return customTasks;
};

// Find task by ID (async version that checks both sources)
export const getTaskById = async (id: string): Promise<TaskItem | undefined> => {
    const tasks = await getTasks();
    return tasks.find(t => t.id === id);
};

// Fetch detailed task information from backend (includes full analytics result)
export const getTaskDetail = async (id: string): Promise<TaskItem | undefined> => {
    // Check if it's a manual test task first
    const stored = localStorage.getItem(STORAGE_KEY);
    const customTasks: TaskItem[] = stored ? JSON.parse(stored) : [];
    const manualTask = customTasks.find(t => t.id === id);
    
    if (manualTask) {
        return manualTask;
    }
    
    // Otherwise fetch from backend
    try {
        const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/tasks/tasks/${id}`);
        
        if (!response.ok) {
            console.error('Failed to fetch task detail');
            return undefined;
        }
        
        const taskData = await response.json();
        
        // Task data already in correct format, but result needs to be assigned
        return {
            ...taskData,
            result: taskData.result ? snakeToCamel(taskData.result) as ModuleAnalysisResult : undefined
        };
    } catch (error) {
        console.error('Error fetching task detail:', error);
        return undefined;
    }
};

export const addManualTask = (result: ModuleAnalysisResult) => {
    const newId = `task-${Date.now()}`;
    const newTask: TaskItem = {
        id: newId,
        studentName: "Test User",
        matriculationNumber: "N/A",
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
