// ============================================
// STEP 0: Personal Data Form
// ============================================

// Personal and university information
export interface PersonalData {
  // Personal data
  firstName: string;
  surname: string;
  streetAndHouseNumber: string;
  zipLocationCountry: string;
  phoneNumber: string;
  tumEmail: string;

  // TUM Course info
  courseAtTUM: string;
  aimedDegree: string;
  registrationNumberAtTUM: string;
  semesterAtTUM: string;

  // Previous University info
  nameOfPreviousUniversity: string;
  countryOfPreviousUniversity: string;
  previousDegreeProgram: string;
  diploma: string;
  numberOfSemestersInPreviousCourse: string;
  workloadOfOneCredit: string;
  maximumGradeAtFormerUniversity: string;
  minimumPassingGradeAtFormerUniversity: string;
}

// Default empty personal data
export const emptyPersonalData: PersonalData = {
  firstName: "",
  surname: "",
  streetAndHouseNumber: "",
  zipLocationCountry: "",
  phoneNumber: "",
  tumEmail: "",
  courseAtTUM: "",
  aimedDegree: "",
  registrationNumberAtTUM: "",
  semesterAtTUM: "",
  nameOfPreviousUniversity: "",
  countryOfPreviousUniversity: "",
  previousDegreeProgram: "",
  diploma: "",
  numberOfSemestersInPreviousCourse: "",
  workloadOfOneCredit: "",
  maximumGradeAtFormerUniversity: "",
  minimumPassingGradeAtFormerUniversity: "",
};

// ============================================
// STEP 1: Mapping Table Extraction (TUM Module-Centric)
// ============================================

// A source course from external university
export interface SourceCourse {
  id: string;
  source_course_no: string;
  source_course_name: string;
  source_credits: string;
  source_grade: string;
  source_content?: string; // Content for this specific course
}

// A TUM module with its equivalent source courses
export interface TUMModuleMapping {
  id: string;
  tum_module_nr: string;
  tum_module_title: string;
  tum_ects: string;
  source_courses: SourceCourse[];
  tum_content: string;  // TUM module content from cache
  tum_outcome: string;  // TUM module outcome from cache
}

// Result from mapping table extraction API
export interface MappingExtractionResult {
  filename: string;
  total_pages: number;
  tum_modules: Omit<TUMModuleMapping, 'id' | 'catalogue_content'>[];
  extracted_at: string;
}

// Helper to create empty source course
export const createEmptySourceCourse = (): SourceCourse => ({
  id: crypto.randomUUID(),
  source_course_no: "",
  source_course_name: "",
  source_credits: "",
  source_grade: "",
});

// Helper to create empty TUM module
export const createEmptyTUMModule = (): TUMModuleMapping => ({
  id: crypto.randomUUID(),
  tum_module_nr: "",
  tum_module_title: "",
  tum_ects: "",
  source_courses: [createEmptySourceCourse()],
  tum_content: "",
  tum_outcome: "",
});

// ============================================
// STEP 2: Catalogue Content Extraction
// ============================================

// Extracted course content from catalogue
export interface CourseContent {
  module_number: string;
  module_name: string;
  module_content: string;
}

// Result from catalogue extraction API
export interface CourseContentResult {
  filename: string;
  courses: CourseContent[];
  extracted_at: string;
}

// ============================================
// App State
// ============================================

export type AppState = {
  personalData: PersonalData;
  mappingFile: File | null;
  tumModules: TUMModuleMapping[];
  step: 'personal' | 'mapping' | 'catalogue' | 'review';
};

// ============================================
// TUM Module Lookup (from cache)
// ============================================

export interface TUMModuleLookup {
  found: boolean;
  module_code: string | null;
  module_title: string | null;
  module_credits: string | null;
  module_content: string | null;
  module_outcome: string | null;
  message: string | null;
}

// ============================================
// Chatbot Types
// ============================================

export interface SourceReference {
  document: string;
  page: number | null;
  chunk_text: string;
  url: string | null;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  sources?: SourceReference[];
}

export type ChatChunkType = 'text' | 'sources' | 'done' | 'error';

export interface ChatStreamChunk {
  type: ChatChunkType;
  content?: string | SourceReference[];
  chat_id?: string;
  retry_after?: number;
}