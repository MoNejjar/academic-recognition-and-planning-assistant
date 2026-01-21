import { createContext, useContext, useState } from "react";
import { AppState, emptyPersonalData } from "../types";


const initialState: AppState = {
  personalData: emptyPersonalData,
  mappingFile: null,
  tumModules: [],
  step: 'personal',
};


const CourseMatchingContext = createContext<{ state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> } | null>(null);

export function CourseMatchingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  return (
    <CourseMatchingContext.Provider value={{ state, setState }}>
      {children}
    </CourseMatchingContext.Provider>
  );
}

export function useCourseMatching() {
  const context = useContext(CourseMatchingContext);
  if (!context) {
    throw new Error("useCourseMatching must be used within CourseMatchingProvider");
  }
  return context;
}
