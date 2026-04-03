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
      setMessage('')
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
      setMessage('success')
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

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '18px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '28px'
          }}>
            🔐
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', margin: '0 0 6px' }}>
            SecureVault
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', margin: 0 }}>
            Create your free account
          </p>
        </div>

        <div style={{
          background:   'white',
          borderRadius: '20px',
          padding:      '32px',
          boxShadow:    '0 20px 60px rgba(0,0,0,0.2)'
        }}>
          {message === 'success' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '48px', margin: '0 0 16px' }}>🎉</p>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>
                Account created!
              </h3>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px' }}>
                Your account is ready to use
              </p>
              <a href="/login" style={{
                display:        'block',
                padding:        '14px',
                background:     'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color:          'white',
                borderRadius:   '12px',
                fontSize:       '15px',
                fontWeight:     '600',
                textDecoration: 'none',
                textAlign:      'center'
              }}>
                Sign in now →
              </a>
            </div>
          ) : step === 'register' ? (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 24px' }}>
                Create account
              </h2>
              <form onSubmit={handleRegister}>
                {[
                  { label: 'Full name',       type: 'text',     val: name,     set: setName,     ph: 'John Doe' },
                  { label: 'Email address',   type: 'email',    val: email,    set: setEmail,    ph: 'you@example.com' },
                ].map(field => (
                  <div key={field.label} style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      placeholder={field.ph}
                      value={field.val}
                      onChange={e => field.set(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '12px 14px',
                        borderRadius: '10px', border: '1px solid #e5e7eb',
                        fontSize: '14px', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '12px 44px 12px 14px',
                        borderRadius: '10px', border: '1px solid #e5e7eb',
                        fontSize: '14px', boxSizing: 'border-box'
                      }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: '16px'
                    }}>
                      {showPass ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                {message && (
                  <div style={{
                    padding: '12px 16px', background: '#fef2f2',
                    border: '1px solid #fecaca', borderRadius: '10px',
                    color: '#dc2626', fontSize: '13px', marginBottom: '16px'
                  }}>
                    ⚠️ {message}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#d1d5db' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: loading ? '#9ca3af' : 'white',
                  border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                  {loading ? 'Creating account...' : 'Create account →'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <p style={{ fontSize: '36px', margin: '0 0 12px' }}>📧</p>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>
                  Check your email
                </h2>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                  We sent a code to <strong>{email}</strong>
                </p>
              </div>
              <form onSubmit={handleConfirm}>
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '14px',
                    borderRadius: '10px', border: '1px solid #e5e7eb',
                    fontSize: '18px', textAlign: 'center',
                    letterSpacing: '4px', boxSizing: 'border-box',
                    marginBottom: '16px'
                  }}
                />
                {message && (
                  <div style={{
                    padding: '12px', background: '#fef2f2',
                    borderRadius: '10px', color: '#dc2626',
                    fontSize: '13px', marginBottom: '16px'
                  }}>
                    ⚠️ {message}
                  </div>
                )}
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? '#d1d5db' : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: loading ? '#9ca3af' : 'white',
                  border: 'none', borderRadius: '12px',
                  fontSize: '15px', fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}>
                  {loading ? 'Verifying...' : 'Verify email →'}
                </button>
              </form>
            </>
          )}

          {message !== 'success' && (
            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
              Already have an account?{' '}
              <a href="/login" style={{ color: '#4f46e5', fontWeight: '600' }}>Sign in</a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}