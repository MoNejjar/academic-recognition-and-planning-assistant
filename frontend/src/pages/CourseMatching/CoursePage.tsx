import { Module } from "@/types/CourseMatching";
import { useCourseMatching } from "../../context/CourseMatchingContext";

export default function CoursePage() {
  const { state, setState } = useCourseMatching();

  if (state.modules.length === 0) {
    return <p>No modules detected yet. Please upload a handbook PDF first.</p>;
  }

  const updateModuleDescription = (index: number, value: string) => {
    const updatedModules = [...state.modules];
    updatedModules[index] = {
      ...updatedModules[index],
      finalDescription: value,
    };

    setState({
      ...state,
      modules: updatedModules,
    });
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Detected Modules</h1>

      {state.modules.map((module : Module, index : number) => (
        <div
          key={module.id}
          style={{
            border: "1px solid #ccc",
            padding: "1rem",
            marginBottom: "1.5rem",
            borderRadius: "8px",
          }}
        >
          <h3>{module.title}</h3>

          <textarea
            value={module.finalDescription}
            onChange={(e) =>
              updateModuleDescription(index, e.target.value)
            }
            rows={8}
            style={{ width: "100%" }}
          />
        </div>
      ))}
    </div>
  );
}
