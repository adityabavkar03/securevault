import { useState } from 'react'
import axios from 'axios'

// Temporary direct Lambda URL for testing (we'll add API Gateway on Day 9)
const LAMBDA_URL = '' // we'll fill this after API Gateway setup

function Upload({ user }) {
  const [file, setFile] = useState(null)
  const [expiry, setExpiry] = useState(24)
  const [status, setStatus] = useState('')
  const [shareLink, setShareLink] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleUpload = async () => {
    if (!file) return setStatus('Please select a file first')

    setUploading(true)
    setStatus('Getting upload URL...')

    try {
      // Step 1: Get pre-signed URL from Lambda
      const res = await axios.post(LAMBDA_URL, {
        fileName: file.name,
        fileType: file.type,
        expiryHours: expiry,
        userId: user?.username || 'testuser'
      })

      const { uploadUrl, fileId } = res.data

      // Step 2: Upload file directly to S3
      setStatus('Uploading file to S3...')
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type }
      })

      setStatus('File uploaded successfully!')
      setShareLink(`File ID: ${fileId} — Share link coming on Day 8!`)

    } catch (err) {
      setStatus('Error: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '20px' }}>
      <h2>Upload File</h2>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="file"
          onChange={e => setFile(e.target.files[0])}
          style={{ width: '100%', padding: '10px', fontSize: '14px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '14px' }}>Link expires after:</label>
        <select
          value={expiry}
          onChange={e => setExpiry(Number(e.target.value))}
          style={{ width: '100%', padding: '10px', fontSize: '14px', marginTop: '6px' }}
        >
          <option value={1}>1 Hour</option>
          <option value={24}>24 Hours</option>
          <option value={168}>7 Days</option>
          <option value={720}>30 Days</option>
        </select>
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          width: '100%',
          padding: '12px',
          background: uploading ? '#888' : '#0f6e56',
          color: 'white',
          border: 'none',
          fontSize: '14px',
          cursor: uploading ? 'not-allowed' : 'pointer',
          borderRadius: '4px'
        }}
      >
        {uploading ? 'Uploading...' : 'Upload File'}
      </button>

      {status && (
        <p style={{ marginTop: '16px', fontSize: '13px', color: '#0f6e56' }}>
          {status}
        </p>
      )}

      {shareLink && (
        <div style={{ marginTop: '12px', padding: '12px', background: '#f0f0f0', borderRadius: '4px' }}>
          <p style={{ fontSize: '13px', margin: 0 }}>{shareLink}</p>
        </div>
      )}
    </div>
  )
}

export default Upload