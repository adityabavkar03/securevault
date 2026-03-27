import { useState } from 'react'
import axios from 'axios'
import config from '../config'

const UPLOAD_URL = config.API_BASE + config.ENDPOINTS.upload
const SHARE_URL  = config.API_BASE + config.ENDPOINTS.share

function Upload({ user }) {
  const [file, setFile]         = useState(null)
  const [expiry, setExpiry]     = useState(24)
  const [status, setStatus]     = useState('')
  const [shareLink, setShareLink] = useState('')
  const [fileId, setFileId]     = useState('')
  const [uploading, setUploading] = useState(false)
  const [step, setStep]         = useState(0)
  // steps: 0=select, 1=uploading, 2=done

  const handleUpload = async () => {
    if (!file) return setStatus('Please select a file first')

    setUploading(true)
    setStep(1)
    setStatus('Getting secure upload URL...')

    try {
      // Step 1: Get pre-signed S3 URL
      const res = await axios.post(UPLOAD_URL, {
        fileName:    file.name,
        fileType:    file.type,
        expiryHours: expiry,
        userId:      user?.username || 'testuser'
      })

      const { uploadUrl, fileId: newFileId } = res.data
      setFileId(newFileId)

      // Step 2: Upload directly to S3
      setStatus('Uploading file securely to cloud...')
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type }
      })

      // Step 3: Generate share link
      setStatus('Generating share link...')
      const shareRes = await axios.post(SHARE_URL, {
        fileId: newFileId
      })

      setShareLink(shareRes.data.downloadUrl)
      setStep(2)
      setStatus('Done!')

    } catch (err) {
      setStatus('Error: ' + err.message)
      setStep(0)
    } finally {
      setUploading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink)
    alert('Link copied to clipboard!')
  }

  return (
    <div style={{ maxWidth: '500px', margin: '40px auto', padding: '24px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2 style={{ color: '#1a2e4a', marginBottom: '20px' }}>Upload File</h2>

      {step !== 2 && (
        <>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>
              Select File
            </label>
            <input
              type="file"
              onChange={e => setFile(e.target.files[0])}
              style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            {file && (
              <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '6px' }}>
              Link expires after
            </label>
            <select
              value={expiry}
              onChange={e => setExpiry(Number(e.target.value))}
              style={{ width: '100%', padding: '10px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
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
              width: '100%', padding: '12px',
              background: uploading ? '#888' : '#0f6e56',
              color: 'white', border: 'none',
              fontSize: '14px', cursor: uploading ? 'not-allowed' : 'pointer',
              borderRadius: '4px'
            }}
          >
            {uploading ? status : 'Upload & Generate Link'}
          </button>
        </>
      )}

      {step === 2 && (
        <div>
          <div style={{ padding: '16px', background: '#e1f5ee', borderRadius: '8px', marginBottom: '16px' }}>
            <p style={{ color: '#0f6e56', fontWeight: '500', margin: '0 0 8px' }}>
              File uploaded successfully!
            </p>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 12px' }}>
              Link expires in {expiry} hour{expiry > 1 ? 's' : ''}
            </p>
            <div style={{ background: 'white', padding: '10px', borderRadius: '4px', wordBreak: 'break-all', fontSize: '12px', color: '#333' }}>
              {shareLink}
            </div>
          </div>

          <button
            onClick={copyLink}
            style={{
              width: '100%', padding: '12px',
              background: '#1a2e4a', color: 'white',
              border: 'none', fontSize: '14px',
              cursor: 'pointer', borderRadius: '4px',
              marginBottom: '10px'
            }}
          >
            Copy Share Link
          </button>

          <button
            onClick={() => { setStep(0); setFile(null); setShareLink(''); setStatus('') }}
            style={{
              width: '100%', padding: '12px',
              background: 'white', color: '#1a2e4a',
              border: '1px solid #1a2e4a', fontSize: '14px',
              cursor: 'pointer', borderRadius: '4px'
            }}
          >
            Upload Another File
          </button>
        </div>
      )}

      {status && step !== 2 && (
        <p style={{ marginTop: '12px', fontSize: '13px', color: '#0f6e56' }}>
          {status}
        </p>
      )}
    </div>
  )
}

export default Upload