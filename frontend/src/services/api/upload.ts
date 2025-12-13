import axios from "axios";
import type { UploadResponse } from "../../types/upload";

export async function uploadPDF(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post<UploadResponse>(
      "http://localhost:8000/upload", // change if your FastAPI runs elsewhere
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Upload error:", error);
    throw new Error(error?.response?.data?.detail || "Upload failed");
  }
}
