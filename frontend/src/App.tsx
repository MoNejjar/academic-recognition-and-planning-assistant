import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home'
import PDFUploadPage from './pages/CourseMatching/PDFUploadPage'
import ReportsPage from './pages/Reports'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<PDFUploadPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </Router>
  )
}

export default App
