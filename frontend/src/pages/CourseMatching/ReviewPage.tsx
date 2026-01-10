import { useCourseMatching } from "../../context/CourseMatchingContext";

export default function ReviewPage() {
  const { state, setState } = useCourseMatching();

  return (
    <div>
      <h1>Review parsed description</h1>

      <textarea
        style={{ width: "100%", height: "200px" }}
        value={state.finalDescription}
        onChange={(e) =>
          setState({ ...state, finalDescription: e.target.value })
        }
      />
    </div>
  );
}
