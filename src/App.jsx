import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  const [user, setUser] = useState(null)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          user
            ? <h2 style={{ padding: '40px' }}>Welcome {user.username}! Dashboard coming on Day 11.</h2>
            : <Navigate to="/login" />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App