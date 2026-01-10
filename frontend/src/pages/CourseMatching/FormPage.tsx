import { useCourseMatching } from "../../context/CourseMatchingContext";

export default function FormPage() {
  const { state, setState } = useCourseMatching();

  return (
    <div>
      <h1>Application for Recognition</h1>

      <h2>Student information</h2>

      <input
        placeholder="First name"
        value={state.studentInfo.firstName}
        onChange={(e) =>
          setState({
            ...state,
            studentInfo: { ...state.studentInfo, firstName: e.target.value },
          })
        }
      />

      <input
        placeholder="Last name"
        value={state.studentInfo.lastName}
        onChange={(e) =>
          setState({
            ...state,
            studentInfo: { ...state.studentInfo, lastName: e.target.value },
          })
        }
      />

      <input
        placeholder="Address"
        value={state.studentInfo.address}
        onChange={(e) =>
          setState({
            ...state,
            studentInfo: { ...state.studentInfo, address: e.target.value },
          })
        }
      />

      <input
        placeholder="Phone number"
        value={state.studentInfo.phone}
        onChange={(e) =>
          setState({
            ...state,
            studentInfo: { ...state.studentInfo, phone: e.target.value },
          })
        }
      />

      <input
        placeholder="TUM email"
        value={state.studentInfo.email}
        onChange={(e) =>
          setState({
            ...state,
            studentInfo: { ...state.studentInfo, email: e.target.value },
          })
        }
      />

      <input
        placeholder="Registration number"
        value={state.studentInfo.registrationNumber}
        onChange={(e) =>
          setState({
            ...state,
            studentInfo: {
              ...state.studentInfo,
              registrationNumber: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Current degree program"
        value={state.studentInfo.currentDegree}
        onChange={(e) =>
          setState({
            ...state,
            studentInfo: {
              ...state.studentInfo,
              currentDegree: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Aimed degree"
        value={state.studentInfo.aimedDegree}
        onChange={(e) =>
          setState({
            ...state,
            studentInfo: {
              ...state.studentInfo,
              aimedDegree: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Current semester"
        value={state.studentInfo.semester}
        onChange={(e) =>
          setState({
            ...state,
            studentInfo: { ...state.studentInfo, semester: e.target.value },
          })
        }
      />

      <h2>Previous studies</h2>

      <input
        placeholder="Previous university"
        value={state.previousStudies.university}
        onChange={(e) =>
          setState({
            ...state,
            previousStudies: {
              ...state.previousStudies,
              university: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Country"
        value={state.previousStudies.country}
        onChange={(e) =>
          setState({
            ...state,
            previousStudies: {
              ...state.previousStudies,
              country: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Previous degree program"
        value={state.previousStudies.degreeProgram}
        onChange={(e) =>
          setState({
            ...state,
            previousStudies: {
              ...state.previousStudies,
              degreeProgram: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Diploma"
        value={state.previousStudies.diploma}
        onChange={(e) =>
          setState({
            ...state,
            previousStudies: {
              ...state.previousStudies,
              diploma: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Number of semesters"
        value={state.previousStudies.numberOfSemesters}
        onChange={(e) =>
          setState({
            ...state,
            previousStudies: {
              ...state.previousStudies,
              numberOfSemesters: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Credit workload (e.g. 1 CP = 30h)"
        value={state.previousStudies.creditWorkload}
        onChange={(e) =>
          setState({
            ...state,
            previousStudies: {
              ...state.previousStudies,
              creditWorkload: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Maximum grade"
        value={state.previousStudies.maxGrade}
        onChange={(e) =>
          setState({
            ...state,
            previousStudies: {
              ...state.previousStudies,
              maxGrade: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Minimum passing grade"
        value={state.previousStudies.minPassingGrade}
        onChange={(e) =>
          setState({
            ...state,
            previousStudies: {
              ...state.previousStudies,
              minPassingGrade: e.target.value,
            },
          })
        }
      />
    </div>
  );
}
