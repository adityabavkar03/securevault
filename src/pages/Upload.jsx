import { useState, useRef } from 'react'
import axios from 'axios'
import config from '../config'
import QRCode from 'qrcode'

const UPLOAD_URL = config.API_BASE + config.ENDPOINTS.upload
const SHARE_URL  = config.API_BASE + config.ENDPOINTS.share

export default function Upload({ user }) {
  const [file,           setFile]           = useState(null)
  const [dragging,       setDragging]       = useState(false)
  const [expiryType,     setExpiryType]     = useState('preset')
  const [expiryPreset,   setExpiryPreset]   = useState(24)
  const [customHours,    setCustomHours]    = useState(1)
  const [customMinutes,  setCustomMinutes]  = useState(0)
  const [protectionType, setProtectionType] = useState('none')
  const [password,       setPassword]       = useState('')
  const [maxDownloads,   setMaxDownloads]   = useState(1)
  const [customMessage,  setCustomMessage]  = useState('')
  const [step,           setStep]           = useState(0)
  const [status,         setStatus]         = useState('')
  const [result,         setResult]         = useState(null)
  const [qrCode,         setQrCode]         = useState('')
  const [uploading,      setUploading]      = useState(false)
  const fileRef = useRef()

  const getExpiryHours = () => {
    if (expiryType === 'preset') return expiryPreset
    return Number(customHours) + Number(customMinutes) / 60
  }

  const getShortLink = (shortCode) => {
    return `${window.location.origin}/f/${shortCode}`
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const handleUpload = async () => {
    if (!file) return setStatus('Please select a file first')
    if ((protectionType === 'password' || protectionType === 'onetime+password') && !password) {
      return setStatus('Please enter a password')
    }

    setUploading(true)
    setStep(1)

    try {
      setStatus('Getting secure upload URL...')
      const res = await axios.post(UPLOAD_URL, {
        fileName:       file.name,
        fileType:       file.type || 'application/octet-stream',
        expiryHours:    getExpiryHours(),
        userId:         user?.username || 'testuser',
        protectionType,
        password,
        maxDownloads:   protectionType === 'onetime' || protectionType === 'onetime+password'
                          ? 1
                          : null,
        customMessage
      })

      const { uploadUrl, fileId, shortCode } = res.data

      setStatus('Uploading file to cloud...')
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' }
      })

      setStatus('Generating share link...')
      const shortLink = getShortLink(shortCode)

      // Generate QR code
      const qr = await QRCode.toDataURL(shortLink, { width: 200, margin: 1 })
      setQrCode(qr)

      setResult({ shortLink, shortCode, fileId, fileName: file.name })
      setStep(2)
      setStatus('Done!')

    } catch (err) {
      console.error(err)
      setStatus('Error: ' + (err.response?.data?.error || err.message))
      setStep(0)
    } finally {
      setUploading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(result.shortLink)
    alert('Link copied!')
  }

  const reset = () => {
    setStep(0); setFile(null); setResult(null)
    setQrCode(''); setStatus(''); setPassword('')
    setProtectionType('none'); setCustomMessage('')
  }

  const protectionOptions = [
    { value: 'none',             icon: '🔓', label: 'No protection',       desc: 'Anyone with link can download' },
    { value: 'password',         icon: '🔑', label: 'Password protected',  desc: 'Requires password to download' },
    { value: 'onetime',          icon: '👁️', label: 'One-time view',       desc: 'Link dies after first download' },
    { value: 'onetime+password', icon: '🔐', label: 'One-time + Password', desc: 'Most secure — once and password' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '32px 16px' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1a2e4a', margin: '0 0 8px' }}>
            🔐 SecureVault
          </h1>
          <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
            Upload files securely with custom protection
          </p>
        </div>

        {/* Card */}
        <div style={{
          background:   'white',
          borderRadius: '16px',
          padding:      '32px',
          boxShadow:    '0 4px 24px rgba(0,0,0,0.08)'
        }}>

          {step !== 2 ? (
            <>
              {/* Drop Zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                style={{
                  border:       `2px dashed ${dragging ? '#0f6e56' : '#ddd'}`,
                  borderRadius: '12px',
                  padding:      '40px 20px',
                  textAlign:    'center',
                  cursor:       'pointer',
                  background:   dragging ? '#f0fdf8' : '#fafafa',
                  transition:   'all 0.2s',
                  marginBottom: '24px'
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={e => setFile(e.target.files[0])}
                />
                {file ? (
                  <div>
                    <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📄</p>
                    <p style={{ fontWeight: '600', color: '#1a2e4a', margin: '0 0 4px' }}>
                      {file.name}
                    </p>
                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: '40px', margin: '0 0 12px' }}>☁️</p>
                    <p style={{ fontWeight: '600', color: '#1a2e4a', margin: '0 0 6px' }}>
                      Drag & drop your file here
                    </p>
                    <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>
                      or click to browse
                    </p>
                  </div>
                )}
              </div>

              {/* Expiry Section */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '10px' }}>
                  ⏰ Link Expiry
                </label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  {['preset', 'custom'].map(t => (
                    <button key={t} onClick={() => setExpiryType(t)} style={{
                      padding:      '6px 16px',
                      borderRadius: '20px',
                      border:       '1px solid #ddd',
                      background:   expiryType === t ? '#1a2e4a' : 'white',
                      color:        expiryType === t ? 'white' : '#666',
                      fontSize:     '12px',
                      cursor:       'pointer',
                      fontWeight:   expiryType === t ? '600' : '400'
                    }}>
                      {t === 'preset' ? 'Quick select' : 'Custom time'}
                    </button>
                  ))}
                </div>

                {expiryType === 'preset' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px' }}>
                    {[
                      { label: '1 Hour',   value: 1 },
                      { label: '24 Hours', value: 24 },
                      { label: '7 Days',   value: 168 },
                      { label: '30 Days',  value: 720 },
                    ].map(opt => (
                      <button key={opt.value} onClick={() => setExpiryPreset(opt.value)} style={{
                        padding:      '10px 6px',
                        borderRadius: '8px',
                        border:       `2px solid ${expiryPreset === opt.value ? '#0f6e56' : '#eee'}`,
                        background:   expiryPreset === opt.value ? '#f0fdf8' : 'white',
                        color:        expiryPreset === opt.value ? '#0f6e56' : '#666',
                        fontSize:     '12px',
                        fontWeight:   expiryPreset === opt.value ? '600' : '400',
                        cursor:       'pointer'
                      }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Hours</label>
                      <input
                        type="number"
                        min="0" max="720"
                        value={customHours}
                        onChange={e => setCustomHours(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                      />
                    </div>
                    <div style={{ paddingTop: '16px', color: '#888', fontWeight: '600' }}>:</div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px', color: '#888', display: 'block', marginBottom: '4px' }}>Minutes</label>
                      <input
                        type="number"
                        min="0" max="59"
                        value={customMinutes}
                        onChange={e => setCustomMinutes(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                      />
                    </div>
                    <div style={{ paddingTop: '16px' }}>
                      <p style={{ fontSize: '11px', color: '#0f6e56', fontWeight: '600', margin: 0 }}>
                        = {(Number(customHours) + Number(customMinutes)/60).toFixed(1)}h
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Protection Type */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '10px' }}>
                  🛡️ Protection Mode
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {protectionOptions.map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => setProtectionType(opt.value)}
                      style={{
                        padding:      '12px',
                        borderRadius: '10px',
                        border:       `2px solid ${protectionType === opt.value ? '#0f6e56' : '#eee'}`,
                        background:   protectionType === opt.value ? '#f0fdf8' : 'white',
                        cursor:       'pointer',
                        transition:   'all 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>{opt.icon}</div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1a2e4a', marginBottom: '2px' }}>
                        {opt.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#888' }}>{opt.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Password Input */}
              {(protectionType === 'password' || protectionType === 'onetime+password') && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
                    🔑 Set Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password for this file"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                  />
                </div>
              )}

              {/* Custom Message */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>
                  💬 Custom Message (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. For Rahul's eyes only 😄"
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                />
              </div>

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={uploading || !file}
                style={{
                  width:        '100%',
                  padding:      '14px',
                  background:   uploading || !file ? '#aaa' : 'linear-gradient(135deg, #1a2e4a, #0f6e56)',
                  color:        'white',
                  border:       'none',
                  borderRadius: '10px',
                  fontSize:     '15px',
                  fontWeight:   '600',
                  cursor:       uploading || !file ? 'not-allowed' : 'pointer'
                }}
              >
                {uploading ? status : '🚀 Upload & Generate Link'}
              </button>

              {/* Progress Steps */}
              {uploading && (
                <div style={{ marginTop: '16px' }}>
                  {[
                    'Getting secure upload URL...',
                    'Uploading file to cloud...',
                    'Generating share link...'
                  ].map((s, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center',
                      gap: '8px', marginBottom: '6px'
                    }}>
                      <div style={{
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        background: status === s ? '#0f6e56' : '#ddd'
                      }}/>
                      <span style={{
                        fontSize: '12px',
                        color:    status === s ? '#0f6e56' : '#bbb',
                        fontWeight: status === s ? '600' : '400'
                      }}>
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {status && !uploading && step === 0 && (
                <p style={{ marginTop: '12px', fontSize: '13px', color: '#c0392b', textAlign: 'center' }}>
                  {status}
                </p>
              )}
            </>
          ) : (
            /* Success Screen */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '64px', height: '64px',
                  background: '#e1f5ee', borderRadius: '50%',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 16px',
                  fontSize: '28px'
                }}>✅</div>
                <h3 style={{ color: '#1a2e4a', margin: '0 0 6px', fontSize: '20px' }}>
                  File uploaded successfully!
                </h3>
                <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                  {result?.fileName} • Protected: {protectionType}
                </p>
              </div>

              {/* Short Link */}
              <div style={{
                background: '#f8f9ff', border: '1px solid #e0e4ff',
                borderRadius: '10px', padding: '16px', marginBottom: '16px'
              }}>
                <p style={{ fontSize: '11px', fontWeight: '600', color: '#888', margin: '0 0 6px', textTransform: 'uppercase' }}>
                  Share Link
                </p>
                <p style={{
                  fontSize: '15px', fontWeight: '700',
                  color: '#1a2e4a', margin: '0 0 8px',
                  wordBreak: 'break-all'
                }}>
                  {result?.shortLink}
                </p>
                <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                  Much shorter than a pre-signed URL!
                </p>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#444', marginBottom: '10px' }}>
                    📱 Scan QR Code to access file
                  </p>
                  <img
                    src={qrCode}
                    alt="QR Code"
                    style={{ width: '160px', height: '160px', border: '4px solid #f0f0f0', borderRadius: '8px' }}
                  />
                </div>
              )}

              {/* Protection badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#fff8e1', border: '1px solid #ffe082',
                borderRadius: '8px', padding: '10px 14px', marginBottom: '16px'
              }}>
                <span style={{ fontSize: '16px' }}>
                  {protectionType === 'none' ? '🔓' :
                   protectionType === 'password' ? '🔑' :
                   protectionType === 'onetime' ? '👁️' : '🔐'}
                </span>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#856404', margin: 0 }}>
                    {protectionType === 'none'             ? 'No protection' :
                     protectionType === 'password'         ? 'Password protected' :
                     protectionType === 'onetime'          ? 'One-time view only' :
                     'One-time + Password'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#aaa', margin: 0 }}>
                    Expires in {getExpiryHours().toFixed(1)} hours
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <button onClick={copyLink} style={{
                width: '100%', padding: '13px', marginBottom: '10px',
                background: 'linear-gradient(135deg, #1a2e4a, #0f6e56)',
                color: 'white', border: 'none', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>
                📋 Copy Share Link
              </button>

              <button onClick={reset} style={{
                width: '100%', padding: '13px',
                background: 'white', color: '#1a2e4a',
                border: '2px solid #1a2e4a', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer'
              }}>
                Upload Another File
              </button>

              <a href="/dashboard" style={{
                display: 'block', textAlign: 'center',
                marginTop: '16px', fontSize: '13px',
                color: '#0f6e56', textDecoration: 'none'
              }}>
                View all files in Dashboard →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}