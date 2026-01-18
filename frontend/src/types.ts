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
// STEP 1: Mapping Table Extraction
// ============================================

// A row from the mapping table (source course → TUM module)
export interface MappingRow {
  id: string;
  // Source university course
  source_course_no: string;
  source_course_name: string;
  source_credits: string;
  source_grade: string;
  // TUM module
  tum_module_nr: string;
  tum_module_title: string;
  tum_ects: string;
  // Matching type: 1:1, n:1 (multiple source -> one TUM), 1:n (one source -> multiple TUM)
  matching_type: string;
  // Group ID to link related rows (for n:1 or 1:n mappings)
  group_id: string;
  // Added after catalogue extraction
  catalogue_content?: string;
  // Status flags
  confirmed: boolean;
}

// Result from mapping table extraction API
export interface MappingExtractionResult {
  filename: string;
  total_pages: number;
  rows: Omit<MappingRow, 'id' | 'confirmed' | 'catalogue_content'>[];
  extracted_at: string;
}

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
// Legacy types (for backwards compatibility)
// ============================================

export type Catalogue = {
  id: string;
  name: string;
  type: "pdf" | "manual";
  file?: File;
  manualText?: string;
  parsedLLM?: any;
};

export type Course = {
  id: string;
  title: string;
  sourceUniversity: string;
  credits?: string;
  description?: string;
  initialParsedData?: any;
  catalogues: Catalogue[];
};

// App state
export type AppState = {
  mappingFile: File | null;
  mappingRows: MappingRow[];
  catalogueFile: File | null;
  step: 'mapping' | 'catalogue' | 'review';
};