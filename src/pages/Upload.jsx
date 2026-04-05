import { useState, useRef } from 'react'
import axios from 'axios'
import config from '../config'
import QRCode from 'qrcode'

const UPLOAD_URL = config.API_BASE + config.ENDPOINTS.upload
const SHARE_URL  = config.API_BASE + config.ENDPOINTS.share

const COLORS = {
  primary:   '#4f46e5',
  secondary: '#7c3aed',
  success:   '#10b981',
  surface:   'white',
  border:    '#e5e7eb',
  muted:     '#6b7280',
  subtle:    '#f9fafb',
  text:      '#111827',
}

export default function Upload({ user }) {
  const [file,           setFile]           = useState(null)
  const [dragging,       setDragging]       = useState(false)
  const [expiryType,     setExpiryType]     = useState('preset')
  const [expiryPreset,   setExpiryPreset]   = useState(24)
  const [customHours,    setCustomHours]    = useState(1)
  const [customMinutes,  setCustomMinutes]  = useState(0)
  const [protectionType, setProtectionType] = useState('none')
  const [password,       setPassword]       = useState('')
  const [showPass,       setShowPass]       = useState(false)
  const [customMessage,  setCustomMessage]  = useState('')
  const [step,           setStep]           = useState(0)
  const [status,         setStatus]         = useState('')
  const [progress,       setProgress]       = useState(0)
  const [result,         setResult]         = useState(null)
  const [qrCode,         setQrCode]         = useState('')
  const [uploading,      setUploading]      = useState(false)
  const fileRef = useRef()

  const getExpiryHours = () =>
    expiryType === 'preset'
      ? expiryPreset
      : Number(customHours) + Number(customMinutes) / 60

  const getShortLink = (shortCode) =>
    `${window.location.origin}/f/${shortCode}`

  const formatFileSize = (bytes) => {
    if (bytes < 1024)        return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`
    return `${(bytes/(1024*1024)).toFixed(1)} MB`
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setFile(dropped)
  }

  const handleUpload = async () => {
    if (!file) return setStatus('Please select a file first')
    if ((protectionType === 'password' || protectionType === 'onetime+password') && !password)
      return setStatus('Please enter a password')

    setUploading(true)
    setStep(1)
    setProgress(10)

    try {
      setStatus('Preparing secure upload...')
      const res = await axios.post(UPLOAD_URL, {
        fileName:       file.name,
        fileType:       file.type || 'application/octet-stream',
        expiryHours:    getExpiryHours(),
        userId: localStorage.getItem('sv_userId') || user?.signInDetails?.loginId || user?.username || 'testuser',
        protectionType,
        password,
        customMessage
      })

      const { uploadUrl, fileId, shortCode } = res.data
      setProgress(40)

      setStatus('Uploading to encrypted storage...')
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 40)
          setProgress(40 + pct)
        }
      })

      setProgress(90)
      setStatus('Generating secure link...')
      const shortLink = getShortLink(shortCode)
      const qr = await QRCode.toDataURL(shortLink, {
        width: 200, margin: 2,
        color: { dark: '#4f46e5', light: '#ffffff' }
      })
      setQrCode(qr)
      setResult({ shortLink, shortCode, fileId, fileName: file.name })
      setProgress(100)
      setStep(2)

    } catch (err) {
      console.error(err)
      setStatus('Error: ' + (err.response?.data?.error || err.message))
      setStep(0)
      setProgress(0)
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setStep(0); setFile(null); setResult(null)
    setQrCode(''); setStatus(''); setPassword('')
    setProtectionType('none'); setCustomMessage('')
    setProgress(0)
  }

  const protectionOptions = [
    { value: 'none',             icon: '🔓', label: 'Open',          desc: 'Anyone with link' },
    { value: 'password',         icon: '🔑', label: 'Password',      desc: 'Requires password' },
    { value: 'onetime',          icon: '👁️', label: 'One-time',      desc: 'Single use only' },
    { value: 'onetime+password', icon: '🔐', label: 'Max Security',  desc: 'Password + one-time' },
  ]

  const expiryPresets = [
    { label: '1h',    value: 1,   full: '1 Hour'   },
    { label: '24h',   value: 24,  full: '24 Hours'  },
    { label: '7d',    value: 168, full: '7 Days'    },
    { label: '30d',   value: 720, full: '30 Days'   },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f7f8fc' }}>
      {/* Hero section */}
      <div style={{
        background:    'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        padding:       '48px 24px 80px',
        textAlign:     'center',
        position:      'relative',
        overflow:      'hidden'
      }}>
        <div style={{
          position:   'absolute', top: 0, left: 0,
          right: 0,   bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity:    0.4
        }}/>
        <h1 style={{
          fontSize:      '36px',
          fontWeight:    '800',
          color:         'white',
          margin:        '0 0 12px',
          letterSpacing: '-0.5px',
          position:      'relative'
        }}>
          Share files securely
        </h1>
        <p style={{
          fontSize:  '16px',
          color:     'rgba(255,255,255,0.8)',
          margin:    0,
          position:  'relative'
        }}>
          End-to-end encrypted • Auto-expiring • Password protected
        </p>
      </div>

      {/* Main card - overlaps hero */}
      <div style={{ maxWidth: '580px', margin: '-48px auto 40px', padding: '0 16px' }}>
        <div style={{
          background:   'white',
          borderRadius: '20px',
          boxShadow:    '0 8px 40px rgba(0,0,0,0.12)',
          overflow:     'hidden',
          position:     'relative'
        }}>

          {step === 0 && (
            <div style={{ padding: '32px' }}>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                style={{
                  border:       `2px dashed ${dragging ? COLORS.primary : '#d1d5db'}`,
                  borderRadius: '16px',
                  padding:      '48px 24px',
                  textAlign:    'center',
                  cursor:       'pointer',
                  background:   dragging ? '#eef2ff' : '#fafafa',
                  transition:   'all 0.2s',
                  marginBottom: '28px'
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
                    <div style={{
                      width:          '56px',
                      height:         '56px',
                      background:     '#eef2ff',
                      borderRadius:   '14px',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      margin:         '0 auto 12px',
                      fontSize:       '26px'
                    }}>
                      {file.type?.includes('image') ? '🖼️' :
                       file.type?.includes('pdf')   ? '📄' :
                       file.type?.includes('video') ? '🎥' : '📁'}
                    </div>
                    <p style={{ fontWeight: '700', fontSize: '15px', color: COLORS.text, margin: '0 0 4px' }}>
                      {file.name}
                    </p>
                    <p style={{ color: COLORS.muted, fontSize: '13px', margin: '0 0 12px' }}>
                      {formatFileSize(file.size)}
                    </p>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null) }}
                      style={{
                        padding:      '6px 14px',
                        background:   'white',
                        border:       '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize:     '12px',
                        color:        COLORS.muted,
                        cursor:       'pointer'
                      }}
                    >
                      Change file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div style={{
                      width:          '64px',
                      height:         '64px',
                      background:     '#eef2ff',
                      borderRadius:   '16px',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      margin:         '0 auto 16px',
                      fontSize:       '28px'
                    }}>
                      ☁️
                    </div>
                    <p style={{ fontWeight: '600', fontSize: '16px', color: COLORS.text, margin: '0 0 6px' }}>
                      Drop your file here
                    </p>
                    <p style={{ color: COLORS.muted, fontSize: '13px', margin: '0 0 16px' }}>
                      or click to browse from your computer
                    </p>
                    <span style={{
                      padding:      '6px 16px',
                      background:   COLORS.primary,
                      color:        'white',
                      borderRadius: '8px',
                      fontSize:     '13px',
                      fontWeight:   '500'
                    }}>
                      Browse files
                    </span>
                  </div>
                )}
              </div>

              {/* Settings section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* Expiry */}
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                    ⏰ Link expires after
                  </p>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    {expiryPresets.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setExpiryType('preset'); setExpiryPreset(opt.value) }}
                        style={{
                          flex:         1,
                          padding:      '10px 4px',
                          borderRadius: '10px',
                          border:       `2px solid ${expiryType === 'preset' && expiryPreset === opt.value ? COLORS.primary : '#e5e7eb'}`,
                          background:   expiryType === 'preset' && expiryPreset === opt.value ? '#eef2ff' : 'white',
                          color:        expiryType === 'preset' && expiryPreset === opt.value ? COLORS.primary : COLORS.muted,
                          fontSize:     '13px',
                          fontWeight:   '600',
                          cursor:       'pointer',
                          transition:   'all 0.15s'
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setExpiryType('custom')}
                      style={{
                        flex:         1,
                        padding:      '10px 4px',
                        borderRadius: '10px',
                        border:       `2px solid ${expiryType === 'custom' ? COLORS.primary : '#e5e7eb'}`,
                        background:   expiryType === 'custom' ? '#eef2ff' : 'white',
                        color:        expiryType === 'custom' ? COLORS.primary : COLORS.muted,
                        fontSize:     '13px',
                        fontWeight:   '600',
                        cursor:       'pointer'
                      }}
                    >
                      Custom
                    </button>
                  </div>

                  {expiryType === 'custom' && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number" min="0" max="720"
                          value={customHours}
                          onChange={e => setCustomHours(e.target.value)}
                          placeholder="Hours"
                          style={{
                            width: '100%', padding: '10px 12px',
                            borderRadius: '10px', border: '1px solid #e5e7eb',
                            fontSize: '14px', boxSizing: 'border-box'
                          }}
                        />
                        <p style={{ fontSize: '11px', color: COLORS.muted, margin: '4px 0 0', textAlign: 'center' }}>Hours</p>
                      </div>
                      <span style={{ color: COLORS.muted, fontWeight: '700', paddingBottom: '16px' }}>:</span>
                      <div style={{ flex: 1 }}>
                        <input
                          type="number" min="0" max="59"
                          value={customMinutes}
                          onChange={e => setCustomMinutes(e.target.value)}
                          placeholder="Minutes"
                          style={{
                            width: '100%', padding: '10px 12px',
                            borderRadius: '10px', border: '1px solid #e5e7eb',
                            fontSize: '14px', boxSizing: 'border-box'
                          }}
                        />
                        <p style={{ fontSize: '11px', color: COLORS.muted, margin: '4px 0 0', textAlign: 'center' }}>Minutes</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Protection */}
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                    🛡️ Protection
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {protectionOptions.map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => setProtectionType(opt.value)}
                        style={{
                          padding:      '14px',
                          borderRadius: '12px',
                          border:       `2px solid ${protectionType === opt.value ? COLORS.primary : '#e5e7eb'}`,
                          background:   protectionType === opt.value ? '#eef2ff' : 'white',
                          cursor:       'pointer',
                          transition:   'all 0.15s'
                        }}
                      >
                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{opt.icon}</div>
                        <div style={{
                          fontSize:   '13px',
                          fontWeight: '600',
                          color:      protectionType === opt.value ? COLORS.primary : COLORS.text,
                          marginBottom: '2px'
                        }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '11px', color: COLORS.muted }}>
                          {opt.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Password input */}
                {(protectionType === 'password' || protectionType === 'onetime+password') && (
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      🔑 Set Password
                    </p>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPass ? 'text' : 'password'}
                        placeholder="Enter a strong password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{
                          width:        '100%',
                          padding:      '12px 44px 12px 14px',
                          borderRadius: '10px',
                          border:       '1px solid #e5e7eb',
                          fontSize:     '14px',
                          boxSizing:    'border-box'
                        }}
                      />
                      <button
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
                )}

                {/* Message */}
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    💬 Message for recipient <span style={{ color: COLORS.muted, fontWeight: '400' }}>(optional)</span>
                  </p>
                  <input
                    type="text"
                    placeholder="e.g. Hey! Here's the file you asked for 👋"
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    style={{
                      width:        '100%',
                      padding:      '12px 14px',
                      borderRadius: '10px',
                      border:       '1px solid #e5e7eb',
                      fontSize:     '14px',
                      boxSizing:    'border-box'
                    }}
                  />
                </div>

                {/* Error */}
                {status && step === 0 && (
                  <div style={{
                    padding:      '12px 16px',
                    background:   '#fef2f2',
                    border:       '1px solid #fecaca',
                    borderRadius: '10px',
                    color:        '#dc2626',
                    fontSize:     '13px'
                  }}>
                    ⚠️ {status}
                  </div>
                )}

                {/* Upload button */}
                <button
                  onClick={handleUpload}
                  disabled={uploading || !file}
                  style={{
                    width:        '100%',
                    padding:      '16px',
                    background:   uploading || !file
                                    ? '#d1d5db'
                                    : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    color:        uploading || !file ? '#9ca3af' : 'white',
                    border:       'none',
                    borderRadius: '12px',
                    fontSize:     '16px',
                    fontWeight:   '600',
                    cursor:       uploading || !file ? 'not-allowed' : 'pointer',
                    transition:   'all 0.2s',
                    letterSpacing: '-0.2px'
                  }}
                >
                  {uploading ? 'Uploading...' : '🚀 Upload & Get Secure Link'}
                </button>
              </div>
            </div>
          )}

          {/* Progress screen */}
          {step === 1 && (
            <div style={{ padding: '48px 32px', textAlign: 'center' }}>
              <div style={{
                width:          '72px',
                height:         '72px',
                background:     '#eef2ff',
                borderRadius:   '50%',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                margin:         '0 auto 20px',
                fontSize:       '32px'
              }}>
                ⬆️
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: COLORS.text, marginBottom: '8px' }}>
                Uploading securely...
              </h3>
              <p style={{ color: COLORS.muted, fontSize: '14px', marginBottom: '28px' }}>
                {status}
              </p>

              {/* Progress bar */}
              <div style={{
                height:       '8px',
                background:   '#e5e7eb',
                borderRadius: '99px',
                overflow:     'hidden',
                marginBottom: '12px'
              }}>
                <div style={{
                  height:     '100%',
                  width:      `${progress}%`,
                  background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                  borderRadius: '99px',
                  transition: 'width 0.3s ease'
                }}/>
              </div>
              <p style={{ fontSize: '13px', color: COLORS.muted }}>{progress}%</p>

              {/* Steps */}
              <div style={{ marginTop: '28px', textAlign: 'left' }}>
                {[
                  { label: 'Preparing secure upload',      done: progress >= 10 },
                  { label: 'Uploading to encrypted storage', done: progress >= 80 },
                  { label: 'Generating secure link',        done: progress >= 100 },
                ].map((s, i) => (
                  <div key={i} style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '10px',
                    padding:      '8px 0',
                    borderBottom: i < 2 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <div style={{
                      width:          '20px',
                      height:         '20px',
                      borderRadius:   '50%',
                      background:     s.done ? '#10b981' : '#e5e7eb',
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       '10px',
                      color:          'white',
                      fontWeight:     '700',
                      flexShrink:     0
                    }}>
                      {s.done ? '✓' : i + 1}
                    </div>
                    <span style={{
                      fontSize:   '13px',
                      color:      s.done ? '#374151' : '#9ca3af',
                      fontWeight: s.done ? '500' : '400'
                    }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success screen */}
          {step === 2 && (
            <div style={{ padding: '32px' }}>
              {/* Success header */}
              <div style={{
                textAlign:    'center',
                padding:      '24px',
                background:   'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                borderRadius: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#065f46', margin: '0 0 4px' }}>
                  File uploaded successfully!
                </h3>
                <p style={{ color: '#059669', fontSize: '14px', margin: 0 }}>
                  {result?.fileName}
                </p>
              </div>

              {/* Short link */}
              <div style={{
                background:   '#f9fafb',
                border:       '1px solid #e5e7eb',
                borderRadius: '14px',
                padding:      '16px',
                marginBottom: '16px'
              }}>
                <p style={{
                  fontSize:      '11px',
                  fontWeight:    '600',
                  color:         COLORS.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  margin:        '0 0 8px'
                }}>
                  Share Link
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    flex:         1,
                    background:   'white',
                    border:       '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding:      '10px 14px',
                    fontSize:     '14px',
                    fontWeight:   '600',
                    color:        COLORS.primary,
                    wordBreak:    'break-all'
                  }}>
                    {result?.shortLink}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(result?.shortLink)
                      alert('Copied!')
                    }}
                    style={{
                      padding:      '10px 16px',
                      background:   COLORS.primary,
                      color:        'white',
                      border:       'none',
                      borderRadius: '10px',
                      fontSize:     '13px',
                      fontWeight:   '600',
                      cursor:       'pointer',
                      whiteSpace:   'nowrap'
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Info row */}
              <div style={{
                display:             'grid',
                gridTemplateColumns: '1fr 1fr',
                gap:                 '10px',
                marginBottom:        '20px'
              }}>
                <div style={{
                  background:   '#f9fafb',
                  borderRadius: '12px',
                  padding:      '14px',
                  textAlign:    'center'
                }}>
                  <p style={{ fontSize: '20px', margin: '0 0 4px' }}>
                    {protectionType === 'none'             ? '🔓' :
                     protectionType === 'password'         ? '🔑' :
                     protectionType === 'onetime'          ? '👁️' : '🔐'}
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 2px' }}>
                    {protectionType === 'none'             ? 'Open access' :
                     protectionType === 'password'         ? 'Password protected' :
                     protectionType === 'onetime'          ? 'One-time view' :
                     'Max security'}
                  </p>
                  <p style={{ fontSize: '11px', color: COLORS.muted, margin: 0 }}>Protection</p>
                </div>
                <div style={{
                  background:   '#f9fafb',
                  borderRadius: '12px',
                  padding:      '14px',
                  textAlign:    'center'
                }}>
                  <p style={{ fontSize: '20px', margin: '0 0 4px' }}>⏱️</p>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#374151', margin: '0 0 2px' }}>
                    {getExpiryHours() < 24
                      ? `${getExpiryHours().toFixed(1)} hours`
                      : `${(getExpiryHours()/24).toFixed(1)} days`}
                  </p>
                  <p style={{ fontSize: '11px', color: COLORS.muted, margin: 0 }}>Expires in</p>
                </div>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div style={{
                  textAlign:    'center',
                  padding:      '20px',
                  background:   '#f9fafb',
                  borderRadius: '14px',
                  marginBottom: '16px'
                }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: '0 0 12px' }}>
                    📱 Scan to access file
                  </p>
                  <img
                    src={qrCode}
                    alt="QR"
                    style={{
                      width:        '140px',
                      height:       '140px',
                      borderRadius: '12px',
                      border:       '4px solid white',
                      boxShadow:    '0 2px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              )}

              {/* Actions */}
              <button
                onClick={reset}
                style={{
                  width:        '100%',
                  padding:      '14px',
                  background:   'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color:        'white',
                  border:       'none',
                  borderRadius: '12px',
                  fontSize:     '15px',
                  fontWeight:   '600',
                  cursor:       'pointer',
                  marginBottom: '10px'
                }}
              >
                Upload Another File
              </button>
              <a
                href="/dashboard"
                style={{
                  display:        'block',
                  textAlign:      'center',
                  padding:        '12px',
                  color:          COLORS.primary,
                  fontSize:       '14px',
                  fontWeight:     '500',
                  borderRadius:   '12px',
                  border:         '1px solid #e5e7eb'
                }}
              >
                View all files →
              </a>
            </div>
          )}
        </div>

        {/* Features row */}
        {step === 0 && (
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap:                 '12px',
            marginTop:           '16px'
          }}>
            {[
              { icon: '🔒', title: 'AES-256 Encrypted',   desc: 'Military grade encryption' },
              { icon: '⚡', title: 'Instant Upload',       desc: 'Direct to S3 cloud storage' },
              { icon: '🗑️', title: 'Auto Delete',          desc: 'Files expire automatically' },
            ].map(f => (
              <div key={f.title} style={{
                background:   'white',
                borderRadius: '14px',
                padding:      '16px',
                textAlign:    'center',
                boxShadow:    '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <p style={{ fontSize: '24px', margin: '0 0 6px' }}>{f.icon}</p>
                <p style={{ fontSize: '12px', fontWeight: '700', color: COLORS.text, margin: '0 0 3px' }}>
                  {f.title}
                </p>
                <p style={{ fontSize: '11px', color: COLORS.muted, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}