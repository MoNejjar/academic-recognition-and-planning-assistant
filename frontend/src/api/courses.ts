import axios from "axios";
import { Catalogue } from "../types";

const API_URL = "http://127.0.0.1:8000/api/student";

export async function parseCourses(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    `${API_URL}/courses/parse`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
}

export async function parseCatalogue(catalogues: Catalogue[]) {
  const formData = new FormData();

  catalogues.forEach((cat) => {
    if (cat.file) {
      formData.append("files", cat.file);
    }
  });

  const res = await axios.post(
    `${API_URL}/courses/parse-catalogue`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
}
