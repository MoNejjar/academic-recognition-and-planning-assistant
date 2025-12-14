import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/Home'
import PDFUploadPage from './pages/CourseMatching/PDFUploadPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/upload" element={<PDFUploadPage />} />
      </Routes>
    </Router>
  )
}

export default App
