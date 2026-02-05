import axios, { AxiosError } from "axios";
import { MappingExtractionResult, CourseContentResult, TUMModuleLookup } from "../types";
import { logApiError } from "../utils/debug";

const API_BASE = "http://127.0.0.1:8000/api";

// Configure axios with timeouts
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 300000, // 5 minutes for LLM parsing
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Error logging interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    logApiError(error, "API Request");
    return Promise.reject(error);
  }
);

// ============================================
// STEP 1: Mapping Table Extraction
// ============================================

/**
 * Extract mapping table from PDF.
 * Returns TUM modules with their equivalent source courses.
 */
export async function extractMappingTable(file: File): Promise<MappingExtractionResult> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log("📤 Extracting mapping table from:", file.name);
    const res = await apiClient.post("/course-matching/extract-mapping-table", formData);
    console.log("✅ Mapping extraction successful:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error extracting mapping table:");

    if (error.code === "ECONNABORTED") {
      throw new Error("Extraction took too long. Server not responding.");
    }

    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || "Invalid PDF file");
    }

    if (error.response?.status === 500) {
      throw new Error(
        error.response.data.detail ||
        "Server error during extraction. Check LLM configuration."
      );
    }

    if (!error.response) {
      throw new Error("Cannot reach server. Check it's running on http://127.0.0.1:8000");
    }

    throw error;
  }
}

// ============================================
// STEP 2: Catalogue Content Extraction
// ============================================

/**
 * Extract course content from catalogue PDFs.
 * Returns all courses found in the catalogues.
 */
export async function extractCatalogueContent(file: File): Promise<CourseContentResult> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    console.log("📤 Extracting catalogue content from:", file.name);
    const res = await apiClient.post("/course-matching/extract-course-content", formData);
    console.log("✅ Catalogue extraction successful:", res.data);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error extracting catalogue:");

    if (error.code === "ECONNABORTED") {
      throw new Error("Extraction took too long. Server not responding.");
    }

    if (error.response?.status === 400) {
      throw new Error(error.response.data.detail || "Invalid PDF file");
    }

    if (error.response?.status === 500) {
      throw new Error(
        error.response.data.detail ||
        "Server error during catalogue extraction."
      );
    }

    if (!error.response) {
      throw new Error("Cannot reach server. Check it's running.");
    }

    throw error;
  }
}

// ============================================
// TUM Module Lookup
// ============================================

/**
 * Look up a TUM module by its code.
 * Returns content and learning outcomes if found.
 */
export async function lookupTUMModule(moduleCode: string): Promise<TUMModuleLookup> {
  try {
    const res = await apiClient.get(`/course-matching/tum-module/${encodeURIComponent(moduleCode)}`, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  } catch (error: any) {
    console.error("❌ Error looking up TUM module:", error);
    return {
      found: false,
      module_code: moduleCode,
      module_title: null,
      module_credits: null,
      module_content: null,
      module_outcome: null,
      message: "Error looking up module. Check if backend is running.",
    };
  }
}

// ============================================
// Demo Content
// ============================================

/**
 * Provision demo documents from the backend.
 * Returns the list of created documents with IDs.
 */
export async function provisionDemoDocuments(): Promise<{ id: string }[]> {
  try {
    const res = await apiClient.post("/documents/demo");
    return res.data;
  } catch (error: any) {
    console.error("❌ Error provisioning demo documents:", error);
    throw error;
  }
}
