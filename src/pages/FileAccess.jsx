import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import config from '../config'

const ACCESS_URL = config.API_BASE + config.ENDPOINTS.access

export default function FileAccess() {
  const { shortCode }  = useParams()
  const [status,       setStatus]       = useState('loading')
  const [fileInfo,     setFileInfo]      = useState(null)
  const [password,     setPassword]      = useState('')
  const [error,        setError]         = useState('')
  const [downloading,  setDownloading]   = useState(false)

  useEffect(() => {
    // Try to access without password first
    tryAccess()
  }, [])

  const tryAccess = async (pwd = '') => {
    setDownloading(true)
    setError('')
    try {
      const res = await axios.post(ACCESS_URL, {
        shortCode,
        password: pwd
      })
      setFileInfo(res.data)
      setStatus('ready')

      // Auto download
      window.location.href = res.data.downloadUrl

    } catch (err) {
      const data = err.response?.data
      if (data?.requirePassword) {
        setStatus('password')
      } else {
        setStatus('error')
        setError(data?.error || 'Something went wrong')
      }
    } finally {
      setDownloading(false)
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    tryAccess(password)
  }

  // Loading screen
  if (status === 'loading') {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <p style={{ fontSize: '40px', margin: '0 0 16px' }}>🔐</p>
          <h3 style={styles.title}>SecureVault</h3>
          <p style={styles.sub}>Verifying secure link...</p>
        </div>
      </div>
    )
  }

  // Password required screen
  if (status === 'password') {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <p style={{ fontSize: '40px', margin: '0 0 16px' }}>🔑</p>
          <h3 style={styles.title}>Password Required</h3>
          <p style={styles.sub}>This file is password protected</p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              autoFocus
            />
            {error && (
              <p style={{ color: '#c0392b', fontSize: '13px', margin: '8px 0' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={downloading}
              style={styles.btn}
            >
              {downloading ? 'Verifying...' : 'Access File'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Ready / downloading screen
  if (status === 'ready') {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <p style={{ fontSize: '40px', margin: '0 0 16px' }}>✅</p>
          <h3 style={styles.title}>Your download is starting!</h3>
          <p style={styles.sub}>{fileInfo?.fileName}</p>
          <p style={{ fontSize: '12px', color: '#aaa', marginTop: '8px' }}>
            If download doesn't start automatically,{' '}
            <a href={fileInfo?.downloadUrl} style={{ color: '#0f6e56' }}>
              click here
            </a>
          </p>
          {fileInfo?.customMessage && (
            <div style={{
              marginTop: '16px', padding: '12px',
              background: '#f0fdf8', borderRadius: '8px',
              border: '1px solid #c3e6d8'
            }}>
              <p style={{ fontSize: '13px', color: '#0f6e56', margin: 0 }}>
                💬 {fileInfo.customMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Error screen
  return (
    <div style={styles.center}>
      <div style={styles.card}>
        <p style={{ fontSize: '40px', margin: '0 0 16px' }}>
          {error?.includes('expired') || error?.includes('used') ? '⏰' : '❌'}
        </p>
        <h3 style={styles.title}>
          {error?.includes('expired') ? 'Link Expired' :
           error?.includes('used')    ? 'Link Already Used' :
           'Link Not Found'}
        </h3>
        <p style={styles.sub}>{error}</p>
        <a href="/" style={{ ...styles.btn, display: 'block', textDecoration: 'none', marginTop: '16px' }}>
          Upload a new file
        </a>
      </div>
    </div>
  )
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    padding: '40px 32px',
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    maxWidth: '400px',
    width: '100%'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a2e4a',
    margin: '0 0 8px'
  },
  sub: {
    fontSize: '14px',
    color: '#888',
    margin: '0 0 20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box'
  },
  btn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #1a2e4a, #0f6e56)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
}