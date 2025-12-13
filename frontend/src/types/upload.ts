export type UploadResponse = {
  message: string; // generic message from backend
  result?: any;    // whatever the backend returns after processing
};