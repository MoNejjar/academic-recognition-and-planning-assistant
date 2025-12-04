import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <Routes>
        {/* TODO: Add routes here */}
        <Route path="/" element={<div>ARIP - Academic Recognition and Planning Assistant</div>} />
      </Routes>
    </Router>
  )
}

export default App
