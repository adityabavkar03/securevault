import { useState, useEffect } from 'react'
import axios from 'axios'
import config from '../config'

const FILES_URL  = config.API_BASE + config.ENDPOINTS.files
const REVOKE_URL = config.API_BASE + config.ENDPOINTS.revoke

function formatTimeLeft(expiresAt) {
  const now  = Math.floor(Date.now() / 1000)
  const diff = expiresAt - now
  if (diff <= 0) return 'Expired'
  const days    = Math.floor(diff / 86400)
  const hours   = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60
  if (days > 0)    return `${days}d ${hours}h`
  if (hours > 0)   return `${hours}h ${minutes}m`
  if (minutes > 0) return `${minutes}m ${seconds}s`
  return `${seconds}s`
}

function formatDate(unix) {
  return new Date(unix * 1000).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

function formatTime(unix) {
  return new Date(unix * 1000).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  })
}

const PROTECTION_MAP = {
  'password':         { icon: '🔑', label: 'Password',     dot: '#f59e0b' },
  'onetime':          { icon: '👁️', label: 'One-time',     dot: '#8b5cf6' },
  'onetime+password': { icon: '🔐', label: 'Max Security', dot: '#ef4444' },
  'none':             { icon: '🔓', label: 'Open',         dot: '#10b981' },
}

function FileRow({ file, onRevoke, index }) {
  const [expanded,  setExpanded]  = useState(false)
  const [copied,    setCopied]    = useState(false)
  const [revoking,  setRevoking]  = useState(false)
  const [timeLeft,  setTimeLeft]  = useState(formatTimeLeft(file.expiresAt))
  const now       = Math.floor(Date.now() / 1000)
  const isExpired = file.expiresAt <= now
  const prot      = PROTECTION_MAP[file.protectionType] || PROTECTION_MAP['none']
  const shortLink = file.shortCode ? `${window.location.origin}/f/${file.shortCode}` : null
  const pct       = isExpired ? 0 : Math.max(0, Math.min(100,
    ((file.expiresAt - now) / (file.expiryHours * 3600)) * 100
  ))

  useEffect(() => {
    if (isExpired) return
    const t = setInterval(() => setTimeLeft(formatTimeLeft(file.expiresAt)), 1000)
    return () => clearInterval(t)
  }, [])

  const handleCopy = async () => {
    if (!shortLink) return
    await navigator.clipboard.writeText(shortLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRevoke = async () => {
    if (!window.confirm(`Delete "${file.fileName}"?`)) return
    setRevoking(true)
    try {
      await axios.post(REVOKE_URL, { fileId: file.fileId, userId: file.userId })
      onRevoke(file.fileId)
    } catch (err) {
      alert(err.message)
      setRevoking(false)
    }
  }

  const fileExt = file.fileName?.split('.').pop()?.toUpperCase() || 'FILE'
  const fileIcon = file.fileType?.includes('image') ? '🖼️'
    : file.fileType?.includes('pdf')   ? '📄'
    : file.fileType?.includes('video') ? '🎥'
    : file.fileType?.includes('audio') ? '🎵'
    : file.fileType?.includes('zip')   ? '📦'
    : '📁'

  return (
    <div style={{
      borderRadius: '12px',
      overflow:     'hidden',
      background:   'white',
      border:       `1px solid ${isExpired ? '#fee2e2' : '#ede9fe'}`,
      marginBottom: '8px',
      transition:   'all 0.2s ease',
      animation:    `fadeSlideIn 0.3s ease ${index * 0.05}s both`
    }}>
      {/* Expiry progress strip */}
      <div style={{ height: '2px', background: '#f1f5f9' }}>
        <div style={{
          height:     '100%',
          width:      `${pct}%`,
          background: pct > 50
            ? 'linear-gradient(90deg, #4f46e5, #7c3aed)'
            : pct > 20
            ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
            : '#ef4444',
          transition: 'width 1s linear'
        }}/>
      </div>

      {/* Main row */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display:    'flex',
          alignItems: 'center',
          padding:    '14px 16px',
          cursor:     'pointer',
          gap:        '12px'
        }}
      >
        {/* Icon */}
        <div style={{
          width:          '40px',
          height:         '40px',
          borderRadius:   '10px',
          background:     isExpired ? '#fef2f2' : '#f5f3ff',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '18px',
          flexShrink:     0,
          position:       'relative'
        }}>
          {fileIcon}
          <span style={{
            position:   'absolute',
            bottom:     '-4px',
            right:      '-4px',
            background: '#4f46e5',
            color:      'white',
            fontSize:   '7px',
            fontWeight: '700',
            padding:    '1px 3px',
            borderRadius: '3px',
            letterSpacing: '0.3px'
          }}>
            {fileExt.slice(0,4)}
          </span>
        </div>

        {/* Name + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight:   '600',
            fontSize:     '14px',
            color:        '#0f172a',
            margin:       '0 0 4px',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap'
          }}>
            {file.fileName}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Status dot */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: isExpired ? '#ef4444' : '#10b981', fontWeight: '600' }}>
              <span style={{
                width:  '5px', height: '5px',
                borderRadius: '50%',
                background: isExpired ? '#ef4444' : '#10b981',
                display: 'inline-block',
                boxShadow: isExpired ? 'none' : '0 0 0 3px rgba(16,185,129,0.2)'
              }}/>
              {isExpired ? 'Expired' : 'Active'}
            </span>
            <span style={{ color: '#e2e8f0' }}>•</span>
            {/* Protection */}
            <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
              {prot.icon} {prot.label}
            </span>
            <span style={{ color: '#e2e8f0' }}>•</span>
            {/* Timer */}
            <span style={{
              fontSize:   '11px',
              fontWeight: '600',
              color:      isExpired ? '#ef4444'
                        : pct < 20 ? '#ef4444'
                        : pct < 50 ? '#f59e0b'
                        : '#4f46e5',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {isExpired ? 'Expired' : `${timeLeft} left`}
            </span>
          </div>
        </div>

        {/* Downloads badge */}
        <div style={{
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          padding:        '6px 12px',
          borderRadius:   '8px',
          background:     '#f8fafc',
          border:         '1px solid #e2e8f0',
          flexShrink:     0
        }}>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#4f46e5', lineHeight: 1 }}>
            {file.downloadCount}
          </span>
          <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            DLs
          </span>
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{
            flexShrink: 0, color: '#94a3b8',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease'
          }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{
          borderTop:  '1px solid #f1f5f9',
          padding:    '16px',
          background: '#fafbff',
          animation:  'expandIn 0.2s ease'
        }}>
          {/* Meta grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:                 '8px',
            marginBottom:        '14px'
          }}>
            {[
              { label: 'Uploaded',   value: `${formatDate(file.uploadedAt)} ${formatTime(file.uploadedAt)}` },
              { label: 'Expires',    value: `${formatDate(file.expiresAt)} ${formatTime(file.expiresAt)}`   },
              { label: 'File type',  value: file.fileType?.split('/')[1]?.toUpperCase() || 'Unknown'        },
            ].map(m => (
              <div key={m.label} style={{
                background:   'white',
                borderRadius: '8px',
                padding:      '10px 12px',
                border:       '1px solid #ede9fe'
              }}>
                <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0 0 3px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {m.label}
                </p>
                <p style={{ fontSize: '12px', color: '#334155', margin: 0, fontWeight: '600' }}>
                  {m.value}
                </p>
              </div>
            ))}
          </div>

          {/* Short link */}
          {shortLink && !isExpired && (
            <div style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '8px',
              background:   '#f5f3ff',
              border:       '1px solid #ddd6fe',
              borderRadius: '8px',
              padding:      '10px 12px',
              marginBottom: '12px'
            }}>
              <span style={{ fontSize: '12px' }}>🔗</span>
              <span style={{
                flex: 1, fontSize: '12px',
                color: '#4f46e5', fontWeight: '600',
                wordBreak: 'break-all'
              }}>
                {shortLink}
              </span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isExpired && shortLink && (
              <button onClick={handleCopy} style={{
                flex:         1,
                padding:      '10px',
                background:   copied
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color:        'white',
                border:       'none',
                borderRadius: '8px',
                fontSize:     '12px',
                fontWeight:   '700',
                cursor:       'pointer',
                transition:   'all 0.2s',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                gap:          '6px'
              }}>
                {copied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
            )}
            <button onClick={handleRevoke} disabled={revoking} style={{
              padding:      '10px 16px',
              background:   'white',
              color:        '#ef4444',
              border:       '1px solid #fca5a5',
              borderRadius: '8px',
              fontSize:     '12px',
              fontWeight:   '700',
              cursor:       revoking ? 'not-allowed' : 'pointer',
              transition:   'all 0.2s'
            }}>
              {revoking ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ user }) {
  const [files,   setFiles]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [loaded,  setLoaded]  = useState(false)

  const userId = localStorage.getItem('sv_userId')
    || user?.signInDetails?.loginId
    || user?.username || 'testuser'

  const displayName = userId.split('@')[0]

  useEffect(() => {
    fetchFiles()
    setTimeout(() => setLoaded(true), 100)
  }, [])

  const fetchFiles = async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await axios.get(`${FILES_URL}?userId=${userId}`)
      const sorted = res.data.files.sort((a, b) => b.uploadedAt - a.uploadedAt)
      setFiles(sorted)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = id => setFiles(p => p.filter(f => f.fileId !== id))

  const now      = Math.floor(Date.now() / 1000)
  const active   = files.filter(f => f.expiresAt > now)
  const expired  = files.filter(f => f.expiresAt <= now)
  const totalDL  = files.reduce((s, f) => s + (f.downloadCount || 0), 0)

  const filtered = files.filter(f => {
    const matchF = filter === 'all' ? true : filter === 'active' ? f.expiresAt > now : f.expiresAt <= now
    const matchS = f.fileName.toLowerCase().includes(search.toLowerCase())
    return matchF && matchS
  })

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{
      minHeight:  '100vh',
      background: '#fafbff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>

      {/* Top banner */}
      <div style={{
        background:    'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        padding:       '40px 24px 100px',
        position:      'relative',
        overflow:      'hidden'
      }}>
        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}/>
        {/* Glows */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(79,70,229,0.35) 0%, transparent 65%)',
          borderRadius: '50%', top: '-150px', right: '-50px',
          animation: 'glow1 8s ease-in-out infinite'
        }}/>
        <div style={{
          position: 'absolute', width: '350px', height: '350px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 65%)',
          borderRadius: '50%', bottom: '-100px', left: '10%',
          animation: 'glow2 11s ease-in-out infinite'
        }}/>

        <div style={{
          position:  'relative',
          zIndex:    2,
          maxWidth:  '760px',
          margin:    '0 auto',
          opacity:   loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(20px)',
          transition:'all 0.5s ease'
        }}>
          <p style={{
            fontSize:      '13px',
            color:         'rgba(255,255,255,0.45)',
            margin:        '0 0 8px',
            fontWeight:    '500',
            letterSpacing: '0.5px'
          }}>
            {greeting},
          </p>
          <h1 style={{
            fontSize:      'clamp(28px, 4vw, 40px)',
            fontWeight:    '800',
            color:         'white',
            margin:        '0 0 6px',
            letterSpacing: '-1px',
            display:       'flex',
            alignItems:    'center',
            gap:           '10px'
          }}>
            {displayName}
            <span style={{ fontSize: '28px' }}>👋</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
            {files.length === 0
              ? 'No files yet — upload your first file'
              : `${active.length} active file${active.length !== 1 ? 's' : ''} · ${totalDL} total downloads`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '-68px auto 40px', padding: '0 16px' }}>

        {/* Stats row */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap:                 '10px',
          marginBottom:        '16px',
          opacity:             loaded ? 1 : 0,
          transform:           loaded ? 'translateY(0)' : 'translateY(16px)',
          transition:          'all 0.5s ease 0.1s'
        }}>
          {[
            { label: 'Total',     value: files.length,  color: '#4f46e5', icon: '📁', bg: 'linear-gradient(135deg, #4f46e5, #6366f1)' },
            { label: 'Active',    value: active.length, color: '#10b981', icon: '✅', bg: 'linear-gradient(135deg, #059669, #10b981)' },
            { label: 'Expired',   value: expired.length,color: '#f59e0b', icon: '⏰', bg: 'linear-gradient(135deg, #d97706, #f59e0b)' },
            { label: 'Downloads', value: totalDL,       color: '#8b5cf6', icon: '⬇️', bg: 'linear-gradient(135deg, #7c3aed, #8b5cf6)' },
          ].map((s, i) => (
            <div key={s.label} style={{
              background:   'white',
              borderRadius: '14px',
              padding:      '16px 14px',
              textAlign:    'center',
              boxShadow:    '0 4px 20px rgba(79,70,229,0.1)',
              border:       '1px solid #ede9fe',
              opacity:      loaded ? 1 : 0,
              transform:    loaded ? 'translateY(0)' : 'translateY(20px)',
              transition:   `all 0.4s ease ${0.1 + i * 0.07}s`
            }}>
              <div style={{
                width:          '36px', height: '36px',
                background:     s.bg,
                borderRadius:   '10px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       '16px',
                margin:         '0 auto 10px',
                boxShadow:      `0 4px 12px ${s.color}40`
              }}>
                {s.icon}
              </div>
              <p style={{
                fontSize:      '28px',
                fontWeight:    '800',
                color:         '#0f172a',
                margin:        '0 0 2px',
                letterSpacing: '-1px',
                lineHeight:    1
              }}>
                {s.value}
              </p>
              <p style={{
                fontSize:      '10px',
                color:         '#94a3b8',
                margin:        0,
                fontWeight:    '700',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{
          background:   'white',
          borderRadius: '14px',
          padding:      '14px',
          marginBottom: '12px',
          boxShadow:    '0 2px 12px rgba(79,70,229,0.08)',
          border:       '1px solid #ede9fe',
          display:      'flex',
          gap:          '10px',
          alignItems:   'center',
          flexWrap:     'wrap'
        }}>
          {/* Search */}
          <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
            <span style={{
              position:  'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none'
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:        '100%',
                padding:      '9px 12px 9px 36px',
                borderRadius: '9px',
                border:       '1.5px solid #ede9fe',
                fontSize:     '13px',
                background:   '#fafbff',
                boxSizing:    'border-box',
                outline:      'none',
                color:        '#0f172a'
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { k: 'all',     l: `All · ${files.length}`      },
              { k: 'active',  l: `Active · ${active.length}`  },
              { k: 'expired', l: `Expired · ${expired.length}`},
            ].map(f => (
              <button key={f.k} onClick={() => setFilter(f.k)} style={{
                padding:      '8px 14px',
                borderRadius: '9px',
                border:       filter === f.k ? 'none' : '1.5px solid #ede9fe',
                background:   filter === f.k
                                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                                : 'white',
                color:        filter === f.k ? 'white' : '#64748b',
                fontSize:     '12px',
                fontWeight:   '700',
                cursor:       'pointer',
                transition:   'all 0.15s',
                whiteSpace:   'nowrap'
              }}>
                {f.l}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button onClick={fetchFiles} style={{
            width:        '36px',
            height:       '36px',
            borderRadius: '9px',
            border:       '1.5px solid #ede9fe',
            background:   'white',
            fontSize:     '16px',
            cursor:       'pointer',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            flexShrink:   0
          }}>
            🔄
          </button>

          {/* Upload shortcut */}
          <a href="/upload" style={{
            padding:        '9px 16px',
            borderRadius:   '9px',
            background:     'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color:          'white',
            fontSize:       '12px',
            fontWeight:     '700',
            textDecoration: 'none',
            whiteSpace:     'nowrap',
            boxShadow:      '0 4px 12px rgba(79,70,229,0.3)',
            flexShrink:     0
          }}>
            + Upload
          </a>
        </div>

        {/* File list */}
        {loading && (
          <div style={{
            textAlign:    'center',
            padding:      '60px',
            background:   'white',
            borderRadius: '14px',
            border:       '1px solid #ede9fe'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px', animation: 'spin 1.2s linear infinite', display: 'inline-block' }}>⏳</div>
            <p style={{ color: '#94a3b8', fontSize: '14px', fontWeight: '500', margin: 0 }}>
              Loading files...
            </p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '14px 16px', background: '#fef2f2',
            borderRadius: '10px', color: '#dc2626',
            fontSize: '13px', border: '1px solid #fecaca',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{
            textAlign:    'center',
            padding:      '60px 20px',
            background:   'white',
            borderRadius: '14px',
            border:       '1px dashed #c4b5fd'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '14px' }}>📂</div>
            <p style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px' }}>
              {filter === 'all' ? 'No files yet' : `No ${filter} files`}
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 20px' }}>
              {filter === 'all' && 'Upload your first encrypted file to get started'}
            </p>
            {filter === 'all' && (
              <a href="/upload" style={{
                padding:        '12px 24px',
                background:     'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color:          'white',
                borderRadius:   '10px',
                textDecoration: 'none',
                fontSize:       '13px',
                fontWeight:     '700',
                boxShadow:      '0 4px 14px rgba(79,70,229,0.35)'
              }}>
                Upload first file
              </a>
            )}
          </div>
        )}

        {!loading && filtered.map((file, i) => (
          <FileRow key={file.fileId} file={file} onRevoke={handleRevoke} index={i} />
        ))}

      </div>

      <style>{`
        @keyframes glow1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-30px, 20px) scale(1.1); }
        }
        @keyframes glow2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(20px,-20px) scale(1.05); }
        }
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes expandIn {
          from { opacity:0; transform:translateY(-8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        input:focus {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.1);
        }
      `}</style>
    </div>
  )
}