import { useState } from 'react'
import { signIn, getCurrentUser, signOut } from 'aws-amplify/auth'

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [message,  setMessage]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      try { await signOut() } catch {}
      await signIn({ username: email, password })
      const user = await getCurrentUser()
      onLogin(user)
      setTimeout(() => { window.location.href = '/dashboard' }, 300)
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:      '100vh',
      background:     'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width:          '64px',
            height:         '64px',
            background:     'rgba(255,255,255,0.15)',
            borderRadius:   '18px',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            margin:         '0 auto 16px',
            fontSize:       '28px',
            backdropFilter: 'blur(10px)'
          }}>
            🔐
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', margin: '0 0 6px' }}>
            SecureVault
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', margin: 0 }}>
            Secure file sharing, simplified
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:   'white',
          borderRadius: '20px',
          padding:      '32px',
          boxShadow:    '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 24px' }}>
            Sign in to your account
          </h2>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width:        '100%',
                  padding:      '12px 14px',
                  borderRadius: '10px',
                  border:       '1px solid #e5e7eb',
                  fontSize:     '14px',
                  boxSizing:    'border-box',
                  outline:      'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{
                    width:        '100%',
                    padding:      '12px 44px 12px 14px',
                    borderRadius: '10px',
                    border:       '1px solid #e5e7eb',
                    fontSize:     '14px',
                    boxSizing:    'border-box',
                    outline:      'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position:   'absolute',
                    right:      '12px',
                    top:        '50%',
                    transform:  'translateY(-50%)',
                    background: 'none',
                    border:     'none',
                    cursor:     'pointer',
                    fontSize:   '16px'
                  }}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {message && (
              <div style={{
                padding:      '12px 16px',
                background:   '#fef2f2',
                border:       '1px solid #fecaca',
                borderRadius: '10px',
                color:        '#dc2626',
                fontSize:     '13px',
                marginBottom: '16px'
              }}>
                ⚠️ {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width:        '100%',
                padding:      '14px',
                background:   loading ? '#d1d5db' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color:        loading ? '#9ca3af' : 'white',
                border:       'none',
                borderRadius: '12px',
                fontSize:     '15px',
                fontWeight:   '600',
                cursor:       loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: '#4f46e5', fontWeight: '600' }}>
              Create one free
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}