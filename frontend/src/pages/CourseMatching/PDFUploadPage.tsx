import { useState } from "react";
import { useCourseMatching } from "../../context/CourseMatchingContext";
import { uploadPDF } from "../../services/api/upload";

export default function UploadPage() {
  const { state, setState } = useCourseMatching();
  const [loading, setLoading] = useState(false);

  async function handleUpload(file: File) {
    setLoading(true);
    const response = await uploadPDF(file);

    setState({
      ...state,
      uploadedFiles: [file],
      parsedDescription: response.parsed_description,
      finalDescription: response.parsed_description,
    });

    setLoading(false);
  }

  return (
    <div>
      <h1>Upload PDF</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => e.target.files && handleUpload(e.target.files[0])}
      />

      {loading && <p>Parsing PDF...</p>}
    </div>
  );
}
