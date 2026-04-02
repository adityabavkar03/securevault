import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth'
import Login    from './pages/Login'
import Register from './pages/Register'
import Upload   from './pages/Upload'

function App() {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const session = await fetchAuthSession()
      if (session?.tokens?.accessToken) {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: '#888' }}>Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={ user ? <Navigate to="/upload" /> : <Login onLogin={setUser} /> } />
        <Route path="/register" element={<Register />} />
        <Route path="/upload"   element={ user ? <Upload user={user} /> : <Navigate to="/login" /> } />
        <Route path="/"         element={ user ? <Navigate to="/upload" /> : <Navigate to="/login" /> } />
      </Routes>
    </BrowserRouter>
  )
}

export default App