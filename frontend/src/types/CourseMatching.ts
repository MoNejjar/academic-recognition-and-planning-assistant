import type { Course } from "./Courses"

export type StudentInfo = {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  registrationNumber: string;
  currentDegree: string;
  aimedDegree: string;
  semester: string;
};

export type Module = {
  id: string;
  title: string;
  parsedDescription: string;
  finalDescription: string;
};

export type PreviousStudies = {
  university: string;
  country: string;
  degreeProgram: string;
  diploma: string;
  numberOfSemesters: string;
  creditWorkload: string;
  maxGrade: string;
  minPassingGrade: string;
};

export type CourseMatchingState = {
  studentInfo: StudentInfo;
  previousStudies: PreviousStudies;
  uploadedFiles: File[];
  modules: [];
};


