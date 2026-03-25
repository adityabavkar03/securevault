import { useState } from 'react'
import { signUp } from 'aws-amplify/auth'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState('register') // 'register' or 'confirm'
  const [message, setMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name
          }
        }
      })
      setMessage('Check your email for verification code!')
      setStep('confirm')
    } catch (err) {
      setMessage(err.message)
    }
  }

  const handleConfirm = async (e) => {
    e.preventDefault()
    try {
      const { confirmSignUp } = await import('aws-amplify/auth')
      await confirmSignUp({ username: email, confirmationCode: code })
      setMessage('Account confirmed! You can now login.')
    } catch (err) {
      setMessage(err.message)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto', padding: '20px' }}>
      <h2>Create Account</h2>

      {step === 'register' ? (
        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', fontSize: '14px' }}
            />
          </div>
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
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', fontSize: '14px' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#0f6e56', color: 'white', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
            Register
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirm}>
          <p>Enter the verification code sent to <b>{email}</b></p>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Verification Code"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', fontSize: '14px' }}
            />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#0f6e56', color: 'white', border: 'none', fontSize: '14px', cursor: 'pointer' }}>
            Confirm Account
          </button>
        </form>
      )}

      {message && (
        <p style={{ marginTop: '12px', color: '#0f6e56', fontSize: '13px' }}>{message}</p>
      )}

      <p style={{ marginTop: '16px', fontSize: '13px' }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  )
}

export default Register