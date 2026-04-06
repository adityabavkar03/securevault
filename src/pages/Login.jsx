import { useState } from 'react'
import { signIn, getCurrentUser, signOut } from 'aws-amplify/auth'

export default function Login({ onLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [message,  setMessage]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [loaded,   setLoaded]   = useState(true)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      try { await signOut() } catch {}
      await signIn({ username: email, password })
      const user = await getCurrentUser()
      localStorage.setItem('sv_userId', email)
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
      background:     'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '20px',
      fontFamily:     '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position:       'relative',
      overflow:       'hidden'
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }}/>
      {/* Glows */}
      <div style={{
        position: 'absolute', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 65%)',
        borderRadius: '50%', top: '-150px', right: '-100px',
        animation: 'glow1 8s ease-in-out infinite'
      }}/>
      <div style={{
        position: 'absolute', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 65%)',
        borderRadius: '50%', bottom: '-100px', left: '-80px',
        animation: 'glow2 11s ease-in-out infinite'
      }}/>

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 2 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              width:          '56px', height: '56px',
              background:     'linear-gradient(135deg, #4f46e5, #7c3aed)',
              borderRadius:   '16px',
              display:        'flex', alignItems: 'center',
              justifyContent: 'center',
              margin:         '0 auto 14px',
              fontSize:       '26px',
              boxShadow:      '0 8px 24px rgba(79,70,229,0.4)'
            }}>🔐</div>
          </a>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Welcome back
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: 0 }}>
            Sign in to your SecureVault
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:    'rgba(255,255,255,0.04)',
          backdropFilter:'blur(20px)',
          borderRadius:  '20px',
          padding:       '32px',
          border:        '1px solid rgba(255,255,255,0.1)',
          boxShadow:     '0 24px 64px rgba(0,0,0,0.3)'
        }}>
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{
                  width:        '100%',
                  padding:      '13px 16px',
                  borderRadius: '12px',
                  border:       '1.5px solid rgba(255,255,255,0.1)',
                  background:   'rgba(255,255,255,0.07)',
                  fontSize:     '14px',
                  boxSizing:    'border-box',
                  outline:      'none',
                  color:        'white',
                  transition:   'border-color 0.2s'
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
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
                    padding:      '13px 44px 13px 16px',
                    borderRadius: '12px',
                    border:       '1.5px solid rgba(255,255,255,0.1)',
                    background:   'rgba(255,255,255,0.07)',
                    fontSize:     '14px',
                    boxSizing:    'border-box',
                    outline:      'none',
                    color:        'white'
                  }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '16px', padding: 0
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {message && (
              <div style={{
                padding:      '12px 16px',
                background:   'rgba(239,68,68,0.15)',
                border:       '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                color:        '#fca5a5',
                fontSize:     '13px',
                marginBottom: '16px',
                fontWeight:   '500'
              }}>
                ⚠️ {message}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width:        '100%',
              padding:      '14px',
              background:   loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color:        loading ? 'rgba(255,255,255,0.4)' : 'white',
              border:       'none',
              borderRadius: '12px',
              fontSize:     '15px',
              fontWeight:   '700',
              cursor:       loading ? 'not-allowed' : 'pointer',
              boxShadow:    loading ? 'none' : '0 6px 20px rgba(79,70,229,0.4)',
              transition:   'all 0.2s',
              letterSpacing:'-0.2px'
            }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
            No account?{' '}
            <a href="/register" style={{ color: '#a5b4fc', fontWeight: '700', textDecoration: 'none' }}>
              Create one free
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes glow1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-30px,20px) scale(1.1); }
        }
        @keyframes glow2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,-20px) scale(1.05); }
        }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input:focus { border-color: rgba(124,58,237,0.6) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; }
      `}</style>
    </div>
  )
}