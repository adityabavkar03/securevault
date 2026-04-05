import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import config from '../config'

const ACCESS_URL = config.API_BASE + config.ENDPOINTS.access

export default function FileAccess() {
  const { shortCode }   = useParams()
  const [status,        setStatus]      = useState('loading')
  const [fileInfo,      setFileInfo]    = useState(null)
  const [password,      setPassword]    = useState('')
  const [showPass,      setShowPass]    = useState(false)
  const [error,         setError]       = useState('')
  const [downloading,   setDownloading] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true
    tryAccess()
  }, [])

  const tryAccess = async (pwd = '') => {
    setDownloading(true)
    setError('')
    try {
      const res = await axios.post(ACCESS_URL, {
        shortCode,
        password:      pwd,
        trackDownload: true
      })
      setFileInfo(res.data)
      setStatus('ready')
      setTimeout(() => { window.location.href = res.data.downloadUrl }, 800)
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

  const bg = 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)'

  const Card = ({ children }) => (
    <div style={{
      minHeight:      '100vh',
      background:     '#f7f8fc',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '20px'
    }}>
      <div style={{
        background:   'white',
        borderRadius: '20px',
        padding:      '48px 36px',
        textAlign:    'center',
        boxShadow:    '0 8px 40px rgba(0,0,0,0.1)',
        maxWidth:     '400px',
        width:        '100%'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>
            🔐 SecureVault
          </span>
        </div>
        {children}
      </div>
    </div>
  )

  if (status === 'loading') return (
    <Card>
      <div style={{
        width: '56px', height: '56px',
        background: '#eef2ff', borderRadius: '50%',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px'
      }}>⏳</div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>
        Verifying link...
      </h3>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
        Checking security & expiry
      </p>
    </Card>
  )

  if (status === 'password') return (
    <Card>
      <div style={{
        width: '56px', height: '56px',
        background: '#fffbeb', borderRadius: '50%',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 16px', fontSize: '24px'
      }}>🔑</div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>
        Password required
      </h3>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px' }}>
        This file is password protected
      </p>
      <form onSubmit={e => { e.preventDefault(); tryAccess(password) }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <input
            type={showPass ? 'text' : 'password'}
            placeholder="Enter password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '14px 44px 14px 14px',
              borderRadius: '12px', border: '2px solid #e5e7eb',
              fontSize: '15px', boxSizing: 'border-box', textAlign: 'center'
            }}
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            style={{
              position: 'absolute', right: '12px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px'
            }}
          >
            {showPass ? '🙈' : '👁️'}
          </button>
        </div>
        {error && (
          <p style={{ color: '#dc2626', fontSize: '13px', margin: '0 0 12px' }}>
            ⚠️ {error}
          </p>
        )}
        <button
          type="submit"
          disabled={downloading}
          style={{
            width: '100%', padding: '14px',
            background: downloading ? '#d1d5db' : bg,
            color: 'white', border: 'none',
            borderRadius: '12px', fontSize: '15px',
            fontWeight: '600', cursor: downloading ? 'not-allowed' : 'pointer'
          }}
        >
          {downloading ? 'Verifying...' : 'Access File →'}
        </button>
      </form>
    </Card>
  )

  if (status === 'ready') return (
    <Card>
      <div style={{
        width: '64px', height: '64px',
        background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
        borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', fontSize: '28px'
      }}>✅</div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 6px' }}>
        Download starting!
      </h3>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 6px' }}>
        {fileInfo?.fileName}
      </p>
      {fileInfo?.customMessage && (
        <div style={{
          marginTop: '16px', padding: '14px',
          background: '#f0fdf4', borderRadius: '12px',
          border: '1px solid #bbf7d0'
        }}>
          <p style={{ fontSize: '14px', color: '#065f46', margin: 0 }}>
            💬 {fileInfo.customMessage}
          </p>
        </div>
      )}
      <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>
        If download doesn't start,{' '}
        <a href={fileInfo?.downloadUrl} style={{ color: '#4f46e5' }}>click here</a>
      </p>
    </Card>
  )

  return (
    <Card>
      <div style={{
        width: '64px', height: '64px',
        background: '#fef2f2', borderRadius: '50%',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 16px', fontSize: '28px'
      }}>
        {error?.includes('expired') || error?.includes('used') ? '⏰' : '❌'}
      </div>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: '0 0 8px' }}>
        {error?.includes('expired') ? 'Link Expired' :
         error?.includes('used')    ? 'Already Used' :
         'Link Not Found'}
      </h3>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px' }}>
        {error}
      </p>
      <a
        href="/"
        style={{
          display: 'block', padding: '14px',
          background: bg, color: 'white',
          borderRadius: '12px', fontSize: '14px',
          fontWeight: '600', textDecoration: 'none'
        }}
      >
        Upload a new file →
      </a>
    </Card>
  )
}