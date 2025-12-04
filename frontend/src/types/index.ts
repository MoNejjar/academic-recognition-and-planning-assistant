/* 
 * Frontend TypeScript Types
 * 
 * Shared type definitions for the frontend
 */

// User types
export interface User {
  id: string;
  email: string;
  role: 'student' | 'staff' | 'professor';
  name: string;
}

// Course matching types
export interface Course {
  id: string;
  name: string;
  credits: number;
  description: string;
  university: string;
}

export interface MatchResult {
  sourceCourseid: string;
  targetCourseId: string;
  matchScore: number;
  isTransferable: boolean;
  explanation?: string;
}

// Document types
export interface Document {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  status: 'pending' | 'validated' | 'rejected';
}

// Report types
export interface Report {
  id: string;
  createdAt: string;
  matchResults: MatchResult[];
  status: 'draft' | 'final';
}

// TODO: Add more types as needed
