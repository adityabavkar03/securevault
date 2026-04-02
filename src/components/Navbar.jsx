import { signOut } from 'aws-amplify/auth'
import { useNavigate } from 'react-router-dom'

function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await signOut()
      onLogout()
      navigate('/login')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <nav style={{
      background:    '#1a2e4a',
      padding:       '0 24px',
      height:        '56px',
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      position:      'sticky',
      top:           0,
      zIndex:        100
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px', color: 'white', fontWeight: '600' }}>
          🔐 SecureVault
        </span>
      </div>

      {/* Nav links */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a href="/dashboard" style={{
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontSize: '13px',
            padding: '6px 12px',
            borderRadius: '6px'
          }}>
            Dashboard
          </a>
          <a href="/upload" style={{
            color: 'rgba(255,255,255,0.8)',
            textDecoration: 'none',
            fontSize: '13px',
            padding: '6px 12px',
            borderRadius: '6px'
          }}>
            Upload
          </a>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
            {user?.username}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding:      '6px 14px',
              background:   'rgba(255,255,255,0.1)',
              color:        'white',
              border:       '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              fontSize:     '12px',
              cursor:       'pointer',
              marginLeft:   '8px'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navbar