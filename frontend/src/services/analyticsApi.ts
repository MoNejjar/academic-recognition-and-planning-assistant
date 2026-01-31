/**
 * Analytics API Service
 * 
 * Handles communication with the backend analytics endpoint.
 */

import { AnalyticsResponse } from '../types/analyticsTypes';
import { snakeToCamel } from '../utils/caseConversion';
import { TUMModuleMapping } from '../types';

// @ts-ignore - Vite injects import.meta.env
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export interface AnalysisRequestData {
    tumModules: TUMModuleMapping[];
    studentName?: string;
    previousUniversity?: string;
    previousCountry?: string;
}

/**
 * Send modules to the backend for analysis.
 */
export async function analyzeModules(data: AnalysisRequestData): Promise<AnalyticsResponse> {
    // Convert TUMModuleMapping to the request format
    const requestBody = {
        tum_modules: data.tumModules.map(mod => ({
            tum_module_nr: mod.tum_module_nr,
            tum_module_title: mod.tum_module_title,
            tum_ects: mod.tum_ects,
            tum_content: mod.tum_content,
            tum_outcome: mod.tum_outcome,
            source_courses: mod.source_courses.map(sc => ({
                source_course_no: sc.source_course_no,
                source_course_name: sc.source_course_name,
                source_credits: sc.source_credits,
                source_grade: sc.source_grade,
                source_content: sc.source_content,
            })),
        })),
        student_name: data.studentName,
        previous_university: data.previousUniversity,
        previous_country: data.previousCountry,
    };

    const response = await fetch(`${API_URL}/api/analytics/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    const data_response = await response.json();
    // Convert snake_case to camelCase
    return snakeToCamel(data_response) as AnalyticsResponse;
}
