
import { ModuleAnalysisResult } from '../types/analyticsTypes';
import { snakeToCamel } from '../utils/caseConversion';

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
    // For real submissions
    submissionId?: string;
    submissionDate?: string;
}

const STORAGE_KEY = 'tum_assistant_custom_tasks';

/**
 * Fetch submissions from backend and convert to TaskItems
 */
const fetchSubmissionsAsTasks = async (): Promise<TaskItem[]> => {
    try {
        const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/api/submissions/submissions`);
        
        if (!response.ok) {
            console.error('Failed to fetch submissions');
            return [];
        }
        
        const data = await response.json();
        const tasks: TaskItem[] = [];
        
        // Convert each submission to multiple tasks (one per module)
        for (const submission of data.submissions) {
            // Fetch full submission details to get module results
            const detailResponse = await fetch(`${API_URL}/api/submissions/submissions/${submission.submission_id}`);
            
            if (detailResponse.ok) {
                const detail = await detailResponse.json();
                
                // Create a task for each module in the submission
                for (const moduleResult of detail.analytics.module_results) {
                    // Convert snake_case to camelCase for frontend compatibility
                    const camelCaseResult = snakeToCamel(moduleResult);
                    
                    tasks.push({
                        id: `${submission.submission_id}-${camelCaseResult.tumModuleNr}`,
                        studentName: submission.student_name,
                        university: submission.previous_university,
                        tumModuleNr: camelCaseResult.tumModuleNr,
                        tumModuleTitle: camelCaseResult.tumModuleTitle,
                        tumEcts: camelCaseResult.tumEcts,
                        score: camelCaseResult.overallScore,
                        decision: camelCaseResult.decisionHint,
                        status: camelCaseResult.status || 'pending', // Use module status, not submission status
                        submissionId: submission.submission_id,
                        submissionDate: submission.submission_date,
                        result: camelCaseResult as ModuleAnalysisResult
                    });
                }
            }
        }
        
        return tasks;
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return [];
    }
};

/**
 * Get all tasks: submissions from backend + manual test tasks from localStorage
 */
export const getTasks = async (): Promise<TaskItem[]> => {
    // Get manual test tasks from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    const customTasks: TaskItem[] = stored ? JSON.parse(stored) : [];
    
    // Get real submissions from backend
    const submissionTasks = await fetchSubmissionsAsTasks();
    
    // Merge both sources (submissions first, then manual tests)
    return [...submissionTasks, ...customTasks];
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
