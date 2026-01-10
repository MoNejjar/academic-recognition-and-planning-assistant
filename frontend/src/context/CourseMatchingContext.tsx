import { createContext, useContext, useState } from "react";
import { CourseMatchingState } from "../types/CourseMatching";


const initialState: CourseMatchingState = {
  studentInfo: {
    firstName: "",
    lastName: "",
    address: "",
    phone: "",
    email: "",
    registrationNumber: "",
    currentDegree: "",
    aimedDegree: "",
    semester: "",
  },
  previousStudies: {
    university: "",
    country: "",
    degreeProgram: "",
    diploma: "",
    numberOfSemesters: "",
    creditWorkload: "",
    maxGrade: "",
    minPassingGrade: "",
  },

  
  uploadedFiles: [],
  modules: [],

  

};


const CourseMatchingContext = createContext<any>(null);

export function CourseMatchingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CourseMatchingState>(initialState);

  return (
    <CourseMatchingContext.Provider value={{ state, setState }}>
      {children}
    </CourseMatchingContext.Provider>
  );
}

export function useCourseMatching() {
  return useContext(CourseMatchingContext);
}
