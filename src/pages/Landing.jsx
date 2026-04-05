import { useState, useEffect, useRef } from 'react'

export default function Landing() {
  const [count1, setCount1] = useState(0)
  const [count2, setCount2] = useState(0)
  const [count3, setCount3] = useState(0)
  const [visible, setVisible] = useState(false)
  const statsRef = useRef()

  // Animate counters when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const targets = [100, 256, 99]
    const setters = [setCount1, setCount2, setCount3]
    setters.forEach((setter, i) => {
      let current = 0
      const increment = targets[i] / 60
      const timer = setInterval(() => {
        current += increment
        if (current >= targets[i]) {
          setter(targets[i])
          clearInterval(timer)
        } else {
          setter(Math.floor(current))
        }
      }, 16)
    })
  }, [visible])

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif', overflowX: 'hidden' }}>

      {/* Navbar */}
      <nav style={{
        position:      'fixed',
        top:           0,
        left:          0,
        right:         0,
        zIndex:        100,
        padding:       '0 48px',
        height:        '68px',
        display:       'flex',
        alignItems:    'center',
        justifyContent:'space-between',
        background:    'rgba(255,255,255,0.9)',
        backdropFilter:'blur(20px)',
        borderBottom:  '1px solid rgba(0,0,0,0.06)',
        boxShadow:     '0 2px 20px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            borderRadius: '10px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px'
          }}>🔐</div>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.5px' }}>
            SecureVault
          </span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <a href="/login" style={{
            padding: '9px 20px', borderRadius: '10px',
            fontSize: '14px', fontWeight: '600',
            color: '#374151', textDecoration: 'none',
            border: '1px solid #e5e7eb', background: 'white'
          }}>
            Sign in
          </a>
          <a href="/register" style={{
            padding: '9px 20px', borderRadius: '10px',
            fontSize: '14px', fontWeight: '600',
            color: 'white', textDecoration: 'none',
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            boxShadow: '0 4px 14px rgba(79,70,229,0.4)'
          }}>
            Get started free →
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        minHeight:      '100vh',
        background:     'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        textAlign:      'center',
        padding:        '120px 24px 80px',
        position:       'relative',
        overflow:       'hidden'
      }}>
        {/* Animated blobs */}
        <div style={{
          position: 'absolute', width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)',
          borderRadius: '50%', top: '-100px', left: '-100px',
          animation: 'float1 8s ease-in-out infinite'
        }}/>
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)',
          borderRadius: '50%', bottom: '-100px', right: '-50px',
          animation: 'float2 10s ease-in-out infinite'
        }}/>
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)',
          borderRadius: '50%', top: '40%', left: '60%',
          animation: 'float3 7s ease-in-out infinite'
        }}/>

        {/* Grid overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}/>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px' }}>
          {/* Badge */}
          <div style={{
            display:        'inline-flex',
            alignItems:     'center',
            gap:            '8px',
            padding:        '6px 16px',
            background:     'rgba(79,70,229,0.2)',
            border:         '1px solid rgba(79,70,229,0.4)',
            borderRadius:   '99px',
            marginBottom:   '28px',
            fontSize:       '13px',
            color:          '#a5b4fc',
            fontWeight:     '500'
          }}>
            <span style={{ width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }}/>
            Now with password protection & one-time links
          </div>

          <h1 style={{
            fontSize:      'clamp(40px, 7vw, 72px)',
            fontWeight:    '900',
            color:         'white',
            margin:        '0 0 24px',
            lineHeight:    1.1,
            letterSpacing: '-2px'
          }}>
            Share Files{' '}
            <span style={{
              background:           'linear-gradient(135deg, #818cf8, #a78bfa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent'
            }}>
              Securely
            </span>
            <br/>with Auto-Expiry
          </h1>

          <p style={{
            fontSize:     '18px',
            color:        'rgba(255,255,255,0.6)',
            margin:       '0 0 40px',
            lineHeight:   1.7,
            maxWidth:     '560px',
            marginLeft:   'auto',
            marginRight:  'auto'
          }}>
            Upload encrypted files, set expiry timers, add password protection
            and share via short links. Files auto-delete when expired.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/register" style={{
              padding:       '16px 32px',
              background:    'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color:         'white',
              borderRadius:  '14px',
              fontSize:      '16px',
              fontWeight:    '700',
              textDecoration:'none',
              boxShadow:     '0 8px 30px rgba(79,70,229,0.5)',
              display:       'flex',
              alignItems:    'center',
              gap:           '8px',
              transition:    'transform 0.2s'
            }}>
              🚀 Start for free
            </a>
            <a href="/login" style={{
              padding:       '16px 32px',
              background:    'rgba(255,255,255,0.08)',
              color:         'white',
              borderRadius:  '14px',
              fontSize:      '16px',
              fontWeight:    '600',
              textDecoration:'none',
              border:        '1px solid rgba(255,255,255,0.15)',
              backdropFilter:'blur(10px)'
            }}>
              Sign in →
            </a>
          </div>

          {/* Trust badges */}
          <div style={{
            display:       'flex',
            gap:           '24px',
            justifyContent:'center',
            marginTop:     '48px',
            flexWrap:      'wrap'
          }}>
            {[
              '🔒 AES-256 Encrypted',
              '⚡ Instant Upload',
              '🗑️ Auto Delete',
              '🌍 AWS Powered'
            ].map(badge => (
              <span key={badge} style={{
                fontSize:   '13px',
                color:      'rgba(255,255,255,0.5)',
                display:    'flex',
                alignItems: 'center',
                gap:        '6px'
              }}>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div
        ref={statsRef}
        style={{
          background: 'white',
          padding:    '60px 24px',
          textAlign:  'center'
        }}
      >
        <div style={{
          maxWidth:            '800px',
          margin:              '0 auto',
          display:             'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap:                 '40px'
        }}>
          {[
            { value: count1, suffix: '+',  label: 'Files Shared',      icon: '📁', color: '#4f46e5' },
            { value: count2, suffix: '-bit', label: 'Encryption Key',  icon: '🔒', color: '#7c3aed' },
            { value: count3, suffix: '.9%', label: 'Uptime Guarantee', icon: '⚡', color: '#10b981' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>{stat.icon}</div>
              <div style={{
                fontSize:   '48px',
                fontWeight: '900',
                color:      stat.color,
                margin:     '0 0 6px',
                letterSpacing: '-2px'
              }}>
                {stat.value}{stat.suffix}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{
              fontSize:      '40px',
              fontWeight:    '800',
              color:         '#0f172a',
              margin:        '0 0 14px',
              letterSpacing: '-1px'
            }}>
              Everything you need to{' '}
              <span style={{
                background:           'linear-gradient(135deg, #4f46e5, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent'
              }}>
                share securely
              </span>
            </h2>
            <p style={{ fontSize: '17px', color: '#64748b', margin: 0 }}>
              Built on AWS — enterprise-grade security for everyone
            </p>
          </div>

          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap:                 '20px'
          }}>
            {[
              { icon: '🔐', title: 'Password Protection',    desc: 'Set a password on any file. Only people with the password can download it.', color: '#4f46e5', bg: '#eef2ff' },
              { icon: '👁️', title: 'One-Time Links',          desc: 'Link automatically deactivates after first download. Perfect for sensitive files.', color: '#7c3aed', bg: '#f5f3ff' },
              { icon: '⏰', title: 'Custom Expiry Timer',     desc: 'Set exact expiry — 30 minutes, 3 hours, or 30 days. Your choice.', color: '#0891b2', bg: '#ecfeff' },
              { icon: '📱', title: 'QR Code Sharing',         desc: 'Every file gets a QR code. Share on WhatsApp or print it.', color: '#059669', bg: '#ecfdf5' },
              { icon: '🔗', title: 'Short Links',             desc: 'Clean short URLs like /f/abc123 instead of ugly pre-signed S3 URLs.', color: '#dc2626', bg: '#fef2f2' },
              { icon: '☁️', title: 'AWS Infrastructure',      desc: 'S3, Lambda, DynamoDB, CloudFront — enterprise cloud behind every upload.', color: '#d97706', bg: '#fffbeb' },
            ].map(f => (
              <div
                key={f.title}
                className="hover-card"
                style={{
                  background:   'white',
                  borderRadius: '16px',
                  padding:      '28px',
                  boxShadow:    '0 2px 12px rgba(0,0,0,0.06)',
                  border:       '1px solid #f1f5f9',
                  transition:   'all 0.3s ease',
                  cursor:       'default'
                }}
              >
                <div style={{
                  width:          '48px',
                  height:         '48px',
                  background:     f.bg,
                  borderRadius:   '12px',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '22px',
                  marginBottom:   '16px'
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: 'white', padding: '80px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '40px', fontWeight: '800',
            color: '#0f172a', margin: '0 0 14px', letterSpacing: '-1px'
          }}>
            How it works
          </h2>
          <p style={{ fontSize: '17px', color: '#64748b', margin: '0 0 56px' }}>
            Share a file in under 30 seconds
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '32px' }}>
            {[
              { step: '01', icon: '☁️', title: 'Upload',    desc: 'Drag & drop your file. It goes directly to encrypted AWS S3 storage.' },
              { step: '02', icon: '🛡️', title: 'Protect',   desc: 'Choose protection mode — open, password, one-time, or max security.' },
              { step: '03', icon: '🔗', title: 'Share',      desc: 'Get a short link + QR code. Share it anywhere. It expires automatically.' },
            ].map(s => (
              <div key={s.step} style={{ textAlign: 'center' }}>
                <div style={{
                  width:          '64px',
                  height:         '64px',
                  background:     'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  borderRadius:   '50%',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontSize:       '26px',
                  margin:         '0 auto 16px',
                  boxShadow:      '0 8px 24px rgba(79,70,229,0.3)'
                }}>
                  {s.icon}
                </div>
                <div style={{
                  fontSize: '11px', fontWeight: '700',
                  color: '#4f46e5', letterSpacing: '2px',
                  textTransform: 'uppercase', marginBottom: '8px'
                }}>
                  Step {s.step}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 8px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dark CTA Section */}
      <div style={{
        background:    'linear-gradient(135deg, #0f0c29, #302b63)',
        padding:       '80px 24px',
        textAlign:     'center',
        position:      'relative',
        overflow:      'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}/>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <h2 style={{
            fontSize: '42px', fontWeight: '900',
            color: 'white', margin: '0 0 16px', letterSpacing: '-1px'
          }}>
            Ready to share securely?
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', margin: '0 0 36px' }}>
            Free forever. No credit card. Powered by AWS.
          </p>
          <a href="/register" style={{
            padding:       '18px 40px',
            background:    'linear-gradient(135deg, #4f46e5, #7c3aed)',
            color:         'white',
            borderRadius:  '14px',
            fontSize:      '17px',
            fontWeight:    '700',
            textDecoration:'none',
            boxShadow:     '0 8px 30px rgba(79,70,229,0.5)',
            display:       'inline-block'
          }}>
            🚀 Get started for free
          </a>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        background:    '#0f172a',
        padding:       '24px',
        textAlign:     'center',
        color:         'rgba(255,255,255,0.4)',
        fontSize:      '13px'
      }}>
        © 2026 SecureVault — Built on AWS • AES-256 Encrypted • Auto-expiring links
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 20px) scale(1.08); }
          66% { transform: translate(20px, -30px) scale(0.92); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -20px); }
        }
        .hover-card:hover {
          transform: translateY(-6px) !important;
          box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
        }
        * { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}