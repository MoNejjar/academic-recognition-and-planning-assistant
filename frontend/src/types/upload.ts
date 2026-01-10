export type UploadResponse = {
  message: string; // generic message from backend
  result?: any;
  parsed_description: string;    // whatever the backend returns after processing
};