import axios, { AxiosError } from "axios";
import { Catalogue } from "../types";
import { logApiError } from "../utils/debug";

const API_URL = "http://127.0.0.1:8000/api/student";

// Configure axios avec des timeouts et intercepteurs
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 secondes pour le parsing LLM
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Intercepteur pour logger les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    logApiError(error, "API Request");
    return Promise.reject(error);
  }
);

export async function parseCourses(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log("📤 Sending file for parsing:", file.name);
    const res = await apiClient.post("/courses/parse", formData);
    console.log("✅ Parsing successful:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error parsing courses:");
    
    if (error.code === "ECONNABORTED") {
      throw new Error("Parsing took too long. Server not responding.");
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || "Invalid file");
    }
    
    if (error.response?.status === 500) {
      throw new Error(
        error.response.data.detail || 
        "Server error during parsing. Check that LLM is properly configured."
      );
    }
    
    if (!error.response) {
      throw new Error("Cannot reach server. Check it's running on http://127.0.0.1:8000");
    }
    
    throw error;
  }
}

export async function parseCatalogue(catalogues: Catalogue[]) {
  const formData = new FormData();
  
  catalogues.forEach((cat) => {
    if (cat.file) {
      formData.append("files", cat.file);
    }
  });

  try {
    console.log("📤 Sending", catalogues.length, "catalogue(s) for parsing");
    const res = await apiClient.post("/courses/parse-catalogue", formData);
    console.log("✅ Catalogue parsing successful:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error parsing catalogues:");
    
    if (error.code === "ECONNABORTED") {
      throw new Error("Parsing took too long. Server not responding.");
    }
    
    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || "Invalid file(s)");
    }
    
    if (error.response?.status === 500) {
      throw new Error(
        error.response.data.detail || 
        "Server error during catalogue parsing."
      );
    }
    
    if (!error.response) {
      throw new Error("Cannot reach server. Check it's running.");
    }
    
    throw error;
  }
}