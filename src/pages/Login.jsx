import { useState } from 'react'
import { signIn, getCurrentUser, signOut } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'

function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [message,  setMessage]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Clear existing session
      try { await signOut() } catch {}

      // Sign in
      await signIn({ username: email, password })

      // Get user
      const user = await getCurrentUser()

      // Set user in App
      onLogin(user)

      setMessage('Login successful!')

      // Small delay then navigate
      setTimeout(() => {
  window.location.href = '/dashboard'
}, 500)

    } catch (err) {
      console.error('Login error:', err)
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '20px' }}>
      <h2>Login to SecureVault</h2>
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '10px',
            background: loading ? '#888' : '#1a2e4a',
            color: 'white', border: 'none',
            fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: '6px'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {message && (
        <p style={{
          marginTop: '12px',
          color: message === 'Login successful!' ? '#0f6e56' : '#c0392b',
          fontSize: '13px'
        }}>
          {message}
        </p>
      )}

      <p style={{ marginTop: '16px', fontSize: '13px' }}>
        No account? <a href="/register">Register</a>
      </p>
    </div>
  )
}

export default Login