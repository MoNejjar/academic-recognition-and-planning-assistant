import { useCourseMatching } from "../../context/CourseMatchingContext";
import axios from "axios";

export default function SubmitPage() {
  const { state } = useCourseMatching();

  async function handleSubmit() {
    await axios.post("http://localhost:8000/submit", state);
    alert("Submitted!");
  }

  return (
    <div>
      <h1>Submit</h1>
      <button onClick={handleSubmit}>Submit to backend</button>
    </div>
  );
}
