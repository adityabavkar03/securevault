import { useState } from 'react'
import { signIn, getCurrentUser } from 'aws-amplify/auth'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signIn({ username: email, password })
      const user = await getCurrentUser()
      setMessage('Login successful!')
      onLogin(user)
    } catch (err) {
      setMessage(err.message)
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
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', fontSize: '14px' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#1a2e4a', color: 'white', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
          Login
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '12px', color: '#0f6e56', fontSize: '13px' }}>{message}</p>
      )}

      <p style={{ marginTop: '16px', fontSize: '13px' }}>
        No account? <a href="/register">Register</a>
      </p>
    </div>
  )
}

export default Login