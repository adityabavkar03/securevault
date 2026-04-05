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
  if (days > 0)    return `${days}d ${hours}h left`
  if (hours > 0)   return `${hours}h ${minutes}m left`
  if (minutes > 0) return `${minutes}m ${seconds}s left`
  return `${seconds}s left`
}

function formatDate(unixTime) {
  return new Date(unixTime * 1000).toLocaleString('en-IN', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit'
  })
}

function getProtectionInfo(type) {
  switch(type) {
    case 'password':         return { icon: '🔑', label: 'Password',       color: '#f59e0b' }
    case 'onetime':          return { icon: '👁️', label: 'One-time',       color: '#8b5cf6' }
    case 'onetime+password': return { icon: '🔐', label: 'Max Security',   color: '#ef4444' }
    default:                 return { icon: '🔓', label: 'Open access',    color: '#10b981' }
  }
}

function FileCard({ file, onRevoke }) {
  const [timeLeft,  setTimeLeft]  = useState(formatTimeLeft(file.expiresAt))
  const [revoking,  setRevoking]  = useState(false)
  const [copying,   setCopying]   = useState(false)
  const [expanded,  setExpanded]  = useState(false)
  const isExpired   = timeLeft === 'Expired'
  const protection  = getProtectionInfo(file.protectionType)

  const shortLink = file.shortCode
    ? `${window.location.origin}/f/${file.shortCode}`
    : null

  useEffect(() => {
    if (isExpired) return
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(file.expiresAt))
    }, 1000)
    return () => clearInterval(timer)
  }, [file.expiresAt])

  const handleCopy = async () => {
    if (!shortLink) return
    setCopying(true)
    try {
      await navigator.clipboard.writeText(shortLink)
      alert('Link copied!')
    } finally {
      setCopying(false)
    }
  }

  const handleRevoke = async () => {
    if (!window.confirm(`Delete "${file.fileName}"?`)) return
    setRevoking(true)
    try {
      await axios.post(REVOKE_URL, {
        fileId: file.fileId,
        userId: file.userId
      })
      onRevoke(file.fileId)
    } catch (err) {
      alert('Error: ' + err.message)
      setRevoking(false)
    }
  }

  return (
    <div style={{
      background:   'white',
      borderRadius: '14px',
      marginBottom: '12px',
      overflow:     'hidden',
      boxShadow:    '0 2px 8px rgba(0,0,0,0.06)',
      border:       `1px solid ${isExpired ? '#fee2e2' : '#f0f0f0'}`,
      transition:   'box-shadow 0.2s'
    }}>
      {/* Card Header */}
      <div
        style={{
          padding:    '16px 18px',
          cursor:     'pointer',
          display:    'flex',
          alignItems: 'center',
          gap:        '14px'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        {/* File icon */}
        <div style={{
          width:          '44px',
          height:         '44px',
          borderRadius:   '10px',
          background:     isExpired ? '#fee2e2' : '#f0fdf8',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '20px',
          flexShrink:     0
        }}>
          {file.fileType?.includes('image') ? '🖼️' :
           file.fileType?.includes('pdf')   ? '📄' :
           file.fileType?.includes('video') ? '🎥' :
           file.fileType?.includes('audio') ? '🎵' : '📁'}
        </div>

        {/* File info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontWeight:   '600',
            fontSize:     '14px',
            color:        '#1a2e4a',
            margin:       '0 0 4px',
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap'
          }}>
            {file.fileName}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Status badge */}
            <span style={{
              padding:      '2px 8px',
              borderRadius: '20px',
              fontSize:     '11px',
              fontWeight:   '600',
              background:   isExpired ? '#fee2e2' : '#dcfce7',
              color:        isExpired ? '#dc2626' : '#16a34a'
            }}>
              {isExpired ? '● Expired' : '● Active'}
            </span>

            {/* Protection badge */}
            <span style={{
              padding:    '2px 8px',
              borderRadius: '20px',
              fontSize:   '11px',
              fontWeight: '500',
              background: '#f3f4f6',
              color:      '#374151'
            }}>
              {protection.icon} {protection.label}
            </span>

            {/* Time left */}
            <span style={{
              fontSize:   '11px',
              color:      isExpired ? '#dc2626' : '#6b7280',
              fontWeight: isExpired ? '600' : '400'
            }}>
              ⏱ {timeLeft}
            </span>
          </div>
        </div>

        {/* Downloads count */}
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <p style={{ fontSize: '20px', fontWeight: '700', color: '#1a2e4a', margin: 0 }}>
            {file.downloadCount}
          </p>
          <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0 }}>downloads</p>
        </div>

        {/* Expand arrow */}
        <span style={{
          color:      '#9ca3af',
          fontSize:   '12px',
          transform:  expanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.2s',
          flexShrink: 0
        }}>
          ▼
        </span>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{
          borderTop: '1px solid #f3f4f6',
          padding:   '14px 18px'
        }}>
          {/* Details grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '1fr 1fr',
            gap:                 '10px',
            marginBottom:        '14px'
          }}>
            {[
              { label: 'Uploaded',  value: formatDate(file.uploadedAt) },
              { label: 'Expires',   value: formatDate(file.expiresAt)  },
              { label: 'File type', value: file.fileType || 'Unknown'  },
              { label: 'Protection', value: `${protection.icon} ${protection.label}` },
            ].map(item => (
              <div key={item.label} style={{
                background:   '#f9fafb',
                borderRadius: '8px',
                padding:      '10px 12px'
              }}>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 2px', textTransform: 'uppercase', fontWeight: '600' }}>
                  {item.label}
                </p>
                <p style={{ fontSize: '13px', color: '#374151', margin: 0, fontWeight: '500' }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Short link */}
          {shortLink && !isExpired && (
            <div style={{
              background:   '#f0fdf8',
              border:       '1px solid #bbf7d0',
              borderRadius: '8px',
              padding:      '10px 12px',
              marginBottom: '12px',
              display:      'flex',
              alignItems:   'center',
              gap:          '8px'
            }}>
              <span style={{ fontSize: '12px', color: '#0f6e56', flex: 1, wordBreak: 'break-all' }}>
                🔗 {shortLink}
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {!isExpired && shortLink && (
              <button
                onClick={handleCopy}
                disabled={copying}
                style={{
                  flex:         1,
                  padding:      '10px',
                  background:   'linear-gradient(135deg, #1a2e4a, #0f6e56)',
                  color:        'white',
                  border:       'none',
                  borderRadius: '8px',
                  fontSize:     '12px',
                  fontWeight:   '600',
                  cursor:       'pointer'
                }}
              >
                {copying ? 'Copying...' : '📋 Copy Link'}
              </button>
            )}
            <button
              onClick={handleRevoke}
              disabled={revoking}
              style={{
                padding:      '10px 16px',
                background:   'white',
                color:        '#dc2626',
                border:       '1px solid #fca5a5',
                borderRadius: '8px',
                fontSize:     '12px',
                fontWeight:   '600',
                cursor:       'pointer'
              }}
            >
              {revoking ? 'Deleting...' : '🗑️ Delete'}
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

  const userId = localStorage.getItem('sv_userId')
  || user?.signInDetails?.loginId
  || user?.username
  || 'testuser'
console.log("Dashboard userId:", userId)

  useEffect(() => { fetchFiles() }, [])

  const fetchFiles = async () => {
    setLoading(true)
    setError('')
    try {
      const res    = await axios.get(`${FILES_URL}?userId=${userId}`)
      const sorted = res.data.files.sort((a, b) => b.uploadedAt - a.uploadedAt)
      setFiles(sorted)
    } catch (err) {
      setError('Failed to load files: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = (fileId) => {
    setFiles(prev => prev.filter(f => f.fileId !== fileId))
  }

  const now = Math.floor(Date.now() / 1000)

  const filteredFiles = files.filter(f => {
    const matchesFilter =
      filter === 'all'     ? true :
      filter === 'active'  ? f.expiresAt > now :
      filter === 'expired' ? f.expiresAt <= now : true

    const matchesSearch = f.fileName.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const activeCount  = files.filter(f => f.expiresAt > now).length
  const expiredCount = files.filter(f => f.expiresAt <= now).length
  const totalDownloads = files.reduce((sum, f) => sum + (f.downloadCount || 0), 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '28px 16px' }}>

        {/* Welcome header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1a2e4a', margin: '0 0 4px' }}>
            Welcome back! 👋
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
            {user?.username || 'User'} • {files.length} files stored securely
          </p>
        </div>

        {/* Stats cards */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap:                 '12px',
          marginBottom:        '24px'
        }}>
          {[
            { label: 'Total Files',      value: files.length,   icon: '📁', color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Active',           value: activeCount,    icon: '✅', color: '#10b981', bg: '#f0fdf4' },
            { label: 'Expired',          value: expiredCount,   icon: '⏰', color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Total Downloads',  value: totalDownloads, icon: '⬇️', color: '#8b5cf6', bg: '#f5f3ff' },
          ].map(stat => (
            <div key={stat.label} style={{
              background:   'white',
              borderRadius: '12px',
              padding:      '16px 12px',
              textAlign:    'center',
              boxShadow:    '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                width:          '36px',
                height:         '36px',
                background:     stat.bg,
                borderRadius:   '10px',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       '18px',
                margin:         '0 auto 8px'
              }}>
                {stat.icon}
              </div>
              <p style={{ fontSize: '22px', fontWeight: '700', color: stat.color, margin: '0 0 2px' }}>
                {stat.value}
              </p>
              <p style={{ fontSize: '10px', color: '#9ca3af', margin: 0, fontWeight: '600', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Search + Filter bar */}
        <div style={{
          display:      'flex',
          gap:          '10px',
          marginBottom: '16px',
          flexWrap:     'wrap'
        }}>
          {/* Search */}
          <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
            <span style={{
              position:  'absolute',
              left:      '12px',
              top:       '50%',
              transform: 'translateY(-50%)',
              fontSize:  '14px'
            }}>🔍</span>
            <input
              type="text"
              placeholder="Search files..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width:        '100%',
                padding:      '10px 12px 10px 36px',
                borderRadius: '10px',
                border:       '1px solid #e5e7eb',
                fontSize:     '13px',
                background:   'white',
                boxSizing:    'border-box'
              }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { key: 'all',     label: `All (${files.length})`        },
              { key: 'active',  label: `Active (${activeCount})`      },
              { key: 'expired', label: `Expired (${expiredCount})`    },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding:      '8px 14px',
                borderRadius: '10px',
                border:       'none',
                background:   filter === f.key ? '#1a2e4a' : 'white',
                color:        filter === f.key ? 'white' : '#6b7280',
                fontSize:     '12px',
                fontWeight:   filter === f.key ? '600' : '400',
                cursor:       'pointer',
                boxShadow:    '0 1px 4px rgba(0,0,0,0.08)'
              }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchFiles}
            style={{
              padding:      '8px 14px',
              borderRadius: '10px',
              border:       'none',
              background:   'white',
              color:        '#6b7280',
              fontSize:     '13px',
              cursor:       'pointer',
              boxShadow:    '0 1px 4px rgba(0,0,0,0.08)'
            }}
          >
            🔄
          </button>
        </div>

        {/* File list */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 12px' }}>⏳</p>
            <p style={{ fontSize: '14px' }}>Loading your files...</p>
          </div>
        )}

        {error && (
          <div style={{
            padding: '16px', background: '#fee2e2',
            borderRadius: '10px', color: '#dc2626', fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && filteredFiles.length === 0 && (
          <div style={{
            textAlign:    'center',
            padding:      '60px 20px',
            background:   'white',
            borderRadius: '16px',
            boxShadow:    '0 2px 8px rgba(0,0,0,0.05)'
          }}>
            <p style={{ fontSize: '48px', margin: '0 0 16px' }}>📂</p>
            <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px' }}>
              No files found
            </p>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 20px' }}>
              {filter === 'all' ? 'Upload your first secure file!' : `No ${filter} files`}
            </p>
            <a href="/upload" style={{
              padding:        '12px 24px',
              background:     'linear-gradient(135deg, #1a2e4a, #0f6e56)',
              color:          'white',
              borderRadius:   '10px',
              textDecoration: 'none',
              fontSize:       '14px',
              fontWeight:     '600'
            }}>
              🚀 Upload First File
            </a>
          </div>
        )}

        {!loading && filteredFiles.map(file => (
          <FileCard
            key={file.fileId}
            file={file}
            onRevoke={handleRevoke}
          />
        ))}

        {/* Upload FAB button */}
        <a
          href="/upload"
          style={{
            position:       'fixed',
            bottom:         '24px',
            right:          '24px',
            width:          '56px',
            height:         '56px',
            background:     'linear-gradient(135deg, #1a2e4a, #0f6e56)',
            borderRadius:   '50%',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       '24px',
            boxShadow:      '0 4px 16px rgba(0,0,0,0.2)',
            textDecoration: 'none',
            zIndex:         99
          }}
          title="Upload new file"
        >
          ➕
        </a>

      </div>
    </div>
  )
}