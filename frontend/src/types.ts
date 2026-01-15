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

export type Course = {
  id: string;
  title: string;
  sourceUniversity: string;
  credits?: string;
  description?: string;
  // Résultat brut du parsing initial du fichier TUM
  initialParsedData?: any;
  // Catalogues pour matcher ce cours
  catalogues: Catalogue[];
};

// État global de l'application
export type AppState = {
  // Le fichier TUM initial uploadé
  tumFile: File | null;
  // Les cours parsés depuis le fichier TUM (modifiables par l'utilisateur)
  courses: Course[];
};