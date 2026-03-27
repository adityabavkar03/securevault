import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Upload from './pages/Upload'

function App() {
  const [user, setUser] = useState(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/upload"   element={
          user
            ? <Upload user={user} />
            : <Navigate to="/login" />
        } />
        <Route path="/" element={
          user
            ? <Navigate to="/upload" />
            : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App