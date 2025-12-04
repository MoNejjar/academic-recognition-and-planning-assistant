/* 
 * Constants
 * 
 * Application-wide constants
 */

export const APP_NAME = 'ARIP';
export const APP_FULL_NAME = 'Academic Recognition and Planning Assistant';

export const ROLES = {
  STUDENT: 'student',
  STAFF: 'staff',
  PROFESSOR: 'professor',
} as const;

export const CURRICULUM_TYPES = {
  GARCHING: 'garching',
  HEILBRONN: 'heilbronn',
} as const;
