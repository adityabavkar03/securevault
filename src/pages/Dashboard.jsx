import { useState, useEffect } from 'react'
import axios from 'axios'
import config from '../config'

const FILES_URL  = config.API_BASE + config.ENDPOINTS.files
const SHARE_URL  = config.API_BASE + config.ENDPOINTS.share
const REVOKE_URL = config.API_BASE + config.ENDPOINTS.revoke

function formatTimeLeft(expiresAt) {
  const now = Math.floor(Date.now() / 1000)
  const diff = expiresAt - now
  if (diff <= 0) return 'Expired'

  const days = Math.floor(diff / 86400)
  const hours = Math.floor((diff % 86400) / 3600)
  const minutes = Math.floor((diff % 3600) / 60)
  const seconds = diff % 60

  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  if (minutes > 0) return `${minutes}m ${seconds}s remaining`
  return `${seconds}s remaining`
}

function formatDate(unixTime) {
  return new Date(unixTime * 1000).toLocaleString('en-IN')
}

function FileCard({ file, userId, onRevoke }) {
  const [copying, setCopying] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [timeLeft, setTimeLeft] = useState(formatTimeLeft(file.expiresAt))
  const isExpired = file.status === 'expired' || timeLeft === 'Expired'

  useEffect(() => {
    if (isExpired) return
    const timer = setInterval(() => {
      setTimeLeft(formatTimeLeft(file.expiresAt))
    }, 1000)
    return () => clearInterval(timer)
  }, [file.expiresAt])

  const handleCopyLink = async () => {
    setCopying(true)
    try {
      const res = await axios.post(SHARE_URL, { fileId: file.fileId })
      await navigator.clipboard.writeText(res.data.downloadUrl)
      alert('Link copied!')
    } catch (err) {
      alert(err.message)
    } finally {
      setCopying(false)
    }
  }

  const handleRevoke = async () => {
    if (!window.confirm('Delete file?')) return
    setRevoking(true)
    try {
      await axios.post(REVOKE_URL, { fileId: file.fileId, userId })
      onRevoke(file.fileId)
    } catch (err) {
      alert(err.message)
      setRevoking(false)
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '10px' }}>
      <h4>{file.fileName}</h4>
      <p>{isExpired ? 'Expired' : 'Active'}</p>
      <p>{timeLeft}</p>

      {!isExpired && (
        <button onClick={handleCopyLink}>
          {copying ? 'Loading...' : 'Copy Link'}
        </button>
      )}

      <button onClick={handleRevoke}>
        {revoking ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}

function Dashboard({ user }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  const userId = user?.username || 'testuser'

  useEffect(() => {
    fetchFiles()
  }, [])

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${FILES_URL}?userId=${userId}`)
      setFiles(res.data.files)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleRevoke = (fileId) => {
    setFiles(prev => prev.filter(f => f.fileId !== fileId))
  }

  return (
    <div style={{ padding: '20px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2>My Files</h2>

        {/* ✅ FIXED BUTTON */}
        <a
          href="/upload"
          style={{
            padding: '10px',
            background: 'green',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none'
          }}
        >
          + Upload File
        </a>
      </div>

      {/* FILE LIST */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        files.map(file => (
          <FileCard
            key={file.fileId}
            file={file}
            userId={userId}
            onRevoke={handleRevoke}
          />
        ))
      )}
    </div>
  )
}

export default Dashboard