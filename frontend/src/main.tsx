import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CourseMatchingProvider } from "./context/CourseMatchingContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CourseMatchingProvider>
      <App />
    </CourseMatchingProvider>
  </React.StrictMode>
);
