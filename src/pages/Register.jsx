import { useState } from 'react'
import { signUp, confirmSignUp } from 'aws-amplify/auth'

export default function Register() {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [code,     setCode]     = useState('')
  const [step,     setStep]     = useState('register')
  const [message,  setMessage]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      await signUp({
        username: email,
        password,
        options: { userAttributes: { email, name } }
      })
      setStep('confirm')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await confirmSignUp({ username: email, confirmationCode: code })
      setStep('success')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sharedBg = {
    minHeight:      '100vh',
    background:     'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '20px',
    fontFamily:     '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    position:       'relative',
    overflow:       'hidden'
  }

  const inputStyle = {
    width:        '100%',
    padding:      '13px 16px',
    borderRadius: '12px',
    border:       '1.5px solid rgba(255,255,255,0.1)',
    background:   'rgba(255,255,255,0.07)',
    fontSize:     '14px',
    boxSizing:    'border-box',
    outline:      'none',
    color:        'white'
  }

  const labelStyle = {
    fontSize:      '12px',
    fontWeight:    '700',
    color:         'rgba(255,255,255,0.6)',
    display:       'block',
    marginBottom:  '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  }

  return (
    <div style={sharedBg}>
      {/* Grid */}
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
              width: '56px', height: '56px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              borderRadius: '16px', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px', fontSize: '26px',
              boxShadow: '0 8px 24px rgba(79,70,229,0.4)'
            }}>🔐</div>
          </a>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            {step === 'success' ? 'You\'re in!' : step === 'confirm' ? 'Check your email' : 'Create account'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', margin: 0 }}>
            {step === 'success' ? 'Account created successfully'
            : step === 'confirm' ? `Code sent to ${email}`
            : 'Free forever — no credit card needed'}
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

          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', margin: '0 0 24px' }}>
                Your account is ready. Start sharing files securely!
              </p>
              <a href="/login" style={{
                display: 'block', padding: '14px',
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white', borderRadius: '12px',
                fontSize: '15px', fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 6px 20px rgba(79,70,229,0.4)'
              }}>
                Sign in now →
              </a>
            </div>
          )}

          {step === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text" placeholder="Aditya Bavkar"
                  value={name} onChange={e => setName(e.target.value)}
                  required style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>Email</label>
                <input
                  type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  required style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                    required style={{ ...inputStyle, paddingRight: '44px' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: '14px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: 0
                  }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {message && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(239,68,68,0.15)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '10px', color: '#fca5a5',
                  fontSize: '13px', marginBottom: '16px', fontWeight: '500'
                }}>
                  ⚠️ {message}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: loading ? 'rgba(255,255,255,0.4)' : 'white',
                border: 'none', borderRadius: '12px',
                fontSize: '15px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(79,70,229,0.4)'
              }}>
                {loading ? 'Creating account...' : 'Create account →'}
              </button>
            </form>
          )}

          {step === 'confirm' && (
            <form onSubmit={handleConfirm}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📧</div>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 }}>
                  Enter the 6-digit code we sent
                </p>
              </div>
              <input
                type="text" placeholder="• • • • • •"
                value={code} onChange={e => setCode(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  textAlign: 'center', fontSize: '24px',
                  letterSpacing: '8px', marginBottom: '16px',
                  fontWeight: '700'
                }}
              />
              {message && (
                <div style={{
                  padding: '12px', background: 'rgba(239,68,68,0.15)',
                  borderRadius: '10px', color: '#fca5a5',
                  fontSize: '13px', marginBottom: '16px'
                }}>
                  ⚠️ {message}
                </div>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px',
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: loading ? 'rgba(255,255,255,0.4)' : 'white',
                border: 'none', borderRadius: '12px',
                fontSize: '15px', fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 6px 20px rgba(79,70,229,0.4)'
              }}>
                {loading ? 'Verifying...' : 'Verify & continue →'}
              </button>
            </form>
          )}

          {step !== 'success' && (
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              {step === 'register' ? 'Already have an account? ' : 'Wrong email? '}
              <a href={step === 'register' ? '/login' : '/register'} style={{ color: '#a5b4fc', fontWeight: '700', textDecoration: 'none' }}>
                {step === 'register' ? 'Sign in' : 'Start over'}
              </a>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes glow1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,20px) scale(1.1)} }
        @keyframes glow2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,-20px) scale(1.05)} }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
        input:focus { border-color: rgba(124,58,237,0.6) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.15) !important; }
      `}</style>
    </div>
  )
}