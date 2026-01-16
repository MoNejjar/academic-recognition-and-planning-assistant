export type StudentInfo = {
  firstName: string;
  lastName: string;
  email: string;
  homeUniversity: string;
};

export type Catalogue = {
  id: string;
  name: string;
  type: "pdf" | "manual";
  file?: File;
  manualText?: string;
  parsedLLM?: any;
};

// University course (external/home university)
export type UniversityCourse = {
  moduleNumber?: string;
  title: string;
  creditPoints?: number;
  originalGrade?: string;
};

// TUM equivalent course
export type TUMCourse = {
  moduleNumber?: string;
  title: string;
  ects?: number;
};

export type Course = {
  id: string;
  // Original university course info
  university: UniversityCourse;
  // TUM equivalent
  tum: TUMCourse;
  // Raw parsed data from LLM
  initialParsedData?: any;
  // Catalogues for matching this course
  catalogues: Catalogue[];
};

// App state
export type AppState = {
  tumFile: File | null;
  courses: Course[];
};