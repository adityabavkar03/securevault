import { useState } from 'react'
import { signOut } from 'aws-amplify/auth'
import { useLocation } from 'react-router-dom'

export default function Navbar({ user, onLogout }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await signOut()
      onLogout()
      window.location.href = '/login'
    } catch (err) {
      console.error(err)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      background:    'white',
      borderBottom:  '1px solid #eef0f6',
      padding:       '0 32px',
      height:        '64px',
      display:       'flex',
      alignItems:    'center',
      justifyContent:'space-between',
      position:      'sticky',
      top:           0,
      zIndex:        100,
      boxShadow:     '0 1px 8px rgba(0,0,0,0.06)'
    }}>
      {/* Logo */}
      <a href="/dashboard" style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '10px',
        textDecoration: 'none'
      }}>
        <div style={{
          width:          '36px',
          height:         '36px',
          background:     'linear-gradient(135deg, #4f46e5, #7c3aed)',
          borderRadius:   '10px',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '18px'
        }}>
          🔐
        </div>
        <span style={{
          fontSize:   '18px',
          fontWeight: '700',
          color:      '#1a1a2e',
          letterSpacing: '-0.3px'
        }}>
          SecureVault
        </span>
      </a>

      {/* Nav links */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { path: '/dashboard', label: 'Dashboard', icon: '📊' },
            { path: '/upload',    label: 'Upload',    icon: '⬆️' },
          ].map(link => (
            <a
              key={link.path}
              href={link.path}
              style={{
                padding:      '8px 16px',
                borderRadius: '8px',
                fontSize:     '14px',
                fontWeight:   isActive(link.path) ? '600' : '400',
                color:        isActive(link.path) ? '#4f46e5' : '#6b7280',
                background:   isActive(link.path) ? '#eef2ff' : 'transparent',
                display:      'flex',
                alignItems:   'center',
                gap:          '6px',
                transition:   'all 0.15s'
              }}
            >
              <span style={{ fontSize: '14px' }}>{link.icon}</span>
              {link.label}
            </a>
          ))}

          {/* Divider */}
          <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 8px' }} />

          {/* User avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width:          '34px',
              height:         '34px',
              background:     'linear-gradient(135deg, #4f46e5, #7c3aed)',
              borderRadius:   '50%',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              color:          'white',
              fontSize:       '13px',
              fontWeight:     '700'
            }}>
              {(user?.username || 'U')[0].toUpperCase()}
            </div>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
              {(user?.signInDetails?.loginId || user?.username || 'User').split('@')[0].substring(0, 12)}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            style={{
              padding:      '8px 16px',
              background:   '#f9fafb',
              color:        '#6b7280',
              border:       '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize:     '13px',
              fontWeight:   '500',
              cursor:       'pointer',
              marginLeft:   '4px',
              transition:   'all 0.15s'
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}