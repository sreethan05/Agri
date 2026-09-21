// src/screens/Auth.jsx — Clean Mobile-First Auth Screen matching Agri App Design
import { useState } from 'react'
import { registerUser, loginUser, saveAuth } from '../utils/api.js'

const DISTRICTS = [
  'Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam',
  'Nalgonda', 'Medak', 'Rangareddy', 'Adilabad', 'Mahabubnagar',
  'Siddipet', 'Suryapet', 'Mancherial', 'Jagtial', 'Kamareddy',
  'Bhadradri Kothagudem', 'Nagarkurnool', 'Wanaparthy'
]

const LANGS = [
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'en', label: 'English' },
]

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'check-email'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Shared form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [village, setVillage] = useState('')
  const [district, setDistrict] = useState('Hyderabad')
  const [lang, setLang] = useState('te')

  // One-Click Demo Login
  const handleQuickDemo = async () => {
    setEmail('test@agri.ai')
    setPassword('test123456')
    setLoading(true)
    setError('')
    try {
      const res = await loginUser({ email: 'test@agri.ai', password: 'test123456' })
      if (res.access_token) {
        saveAuth(res.access_token, res.refresh_token, res.user)
        onAuthSuccess(res.user)
      } else {
        setError('Login succeeded, but no session token received.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo login failed. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please fill in both Email and Password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await loginUser({ email: email.trim(), password })
      if (res.access_token) {
        saveAuth(res.access_token, res.refresh_token, res.user)
        onAuthSuccess(res.user)
      } else {
        setError('Login successful, but no token returned.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Register
  const handleRegister = async (e) => {
    if (e) e.preventDefault()
    if (!email.trim() || !password || !fullName.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await registerUser({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        phone: phone.trim(),
        village: village.trim(),
        district,
        preferred_lang: lang
      })
      setMode('check-email')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Password strength calculation
  const passStrength = !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3

  return (
    <div style={{
      maxWidth: 430,
      margin: '0 auto',
      minHeight: '100vh',
      background: '#f0fdf4',
      fontFamily: "'Nunito', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 0 40px rgba(0,0,0,0.12)',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .auth-input:focus {
          border-color: #059669 !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(5,150,105,0.15) !important;
        }
      `}</style>

      {/* ── TOP HERO HEADER (Matches App & Home screen) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #059669 60%, #34d399 100%)',
        padding: '36px 20px 28px',
        borderRadius: '0 0 32px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(6,78,59,0.25)',
        marginBottom: 16
      }}>
        {/* Background decorative circles */}
        <div style={{
          position: 'absolute', top: -25, right: -25, width: 110, height: 110,
          borderRadius: '50%', background: 'rgba(255,255,255,0.08)'
        }} />
        <div style={{
          position: 'absolute', bottom: -35, left: -10, width: 90, height: 90,
          borderRadius: '50%', background: 'rgba(255,255,255,0.06)'
        }} />

        {/* Logo Icon */}
        <div style={{
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          margin: '0 auto 10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          🌿
        </div>

        <h1 style={{
          color: '#ffffff',
          fontSize: 26,
          fontWeight: 900,
          margin: '0 0 4px',
          letterSpacing: '-0.3px'
        }}>
          Agri AI
        </h1>
        <p style={{
          color: '#a7f3d0',
          fontSize: 13,
          fontWeight: 600,
          margin: 0
        }}>
          Smart Farming & Plant Disease Assistant
        </p>
      </div>

      <div style={{ padding: '0 16px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ── TAB SWITCHER (Login vs Register) ── */}
        {mode !== 'check-email' && (
          <div style={{
            display: 'flex',
            background: '#e5e7eb',
            borderRadius: 14,
            padding: 4,
            marginBottom: 16
          }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setError('') }}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 11,
                border: 'none',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                background: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#059669' : '#6b7280',
                boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>🔑</span>
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => { setMode('register'); setError('') }}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 11,
                border: 'none',
                fontWeight: 800,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit',
                background: mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? '#059669' : '#6b7280',
                boxShadow: mode === 'register' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <span>✍️</span>
              <span>Register</span>
            </button>
          </div>
        )}

        {/* ── 1-CLICK DEMO ACCESS CARD (Shown on Login) ── */}
        {mode === 'login' && (
          <div style={{
            background: '#fefce8',
            border: '1.5px dashed #f59e0b',
            borderRadius: 14,
            padding: '12px 14px',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span>⚡</span>
                <span>Quick Demo Login</span>
              </div>
              <div style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>
                test@agri.ai · test123456
              </div>
            </div>
            <button
              type="button"
              onClick={handleQuickDemo}
              disabled={loading}
              style={{
                background: '#f59e0b',
                color: '#ffffff',
                border: 'none',
                borderRadius: 10,
                padding: '8px 12px',
                fontSize: 12,
                fontWeight: 800,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap'
              }}
            >
              {loading ? 'Logging in...' : '1-Click Login'}
            </button>
          </div>
        )}

        {/* ── ERROR MESSAGE BANNER ── */}
        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 12,
            padding: '10px 14px',
            marginBottom: 16,
            color: '#dc2626',
            fontSize: 13,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}>
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError('')}
              type="button"
              style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 900, cursor: 'pointer', fontSize: 16 }}
            >
              ×
            </button>
          </div>
        )}

        {/* ── VIEW 1: EMAIL VERIFICATION SCREEN ── */}
        {mode === 'check-email' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '28px 20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#064e3b', marginBottom: 8 }}>
              Check Your Email
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5, marginBottom: 12 }}>
              A confirmation link has been sent to:<br />
              <strong style={{ color: '#059669' }}>{email}</strong>
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, marginBottom: 20 }}>
              Click the link in the email to verify your account, then return here to log in.
            </p>
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                width: '100%',
                padding: '13px 0',
                borderRadius: 12,
                background: '#059669',
                color: '#ffffff',
                border: 'none',
                fontSize: 15,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              🔑 Go to Login
            </button>
          </div>
        )}

        {/* ── VIEW 2: LOGIN FORM CARD ── */}
        {mode === 'login' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '22px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#064e3b', margin: '0 0 4px' }}>
                Welcome Back 👋
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                Sign in to manage your crops and detect diseases
              </p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    fontSize: 14,
                    border: '2px solid #e5e7eb',
                    background: '#f9fafb',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                    Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <span
                    onClick={() => setShowPass(!showPass)}
                    style={{ fontSize: 12, fontWeight: 700, color: '#059669', cursor: 'pointer', userSelect: 'none' }}
                  >
                    {showPass ? '🙈 Hide' : '👁️ Show'}
                  </span>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 12,
                    fontSize: 14,
                    border: '2px solid #e5e7eb',
                    background: '#f9fafb',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease'
                  }}
                />
              </div>

              {/* Remember Me & Help */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                fontSize: 13
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#4b5563', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor: '#059669' }}
                  />
                  <span>Remember me</span>
                </label>
                <span
                  onClick={() => alert('Please use the Quick Demo Login or contact your support agent.')}
                  style={{ color: '#059669', fontWeight: 700, cursor: 'pointer' }}
                >
                  Forgot password?
                </span>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px 0',
                  borderRadius: 12,
                  background: loading ? '#9ca3af' : '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 3px 12px rgba(5,150,105,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading && <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>}
                <span>Login to Agri AI →</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#6b7280' }}>
              No account?{' '}
              <span
                onClick={() => { setMode('register'); setError('') }}
                style={{ color: '#059669', fontWeight: 800, cursor: 'pointer' }}
              >
                Register here →
              </span>
            </div>
          </div>
        )}

        {/* ── VIEW 3: REGISTER FORM CARD ── */}
        {mode === 'register' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: '22px 18px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ marginBottom: 18 }}>
              <h2 style={{ fontSize: 19, fontWeight: 900, color: '#064e3b', margin: '0 0 4px' }}>
                Create Farmer Profile 🌱
              </h2>
              <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
                Join to receive customized fertilizer advice and weather alerts
              </p>
            </div>

            <form onSubmit={handleRegister}>
              {/* Full Name */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                  Full Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  className="auth-input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Ramesh Reddy"
                  required
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                    border: '2px solid #e5e7eb', background: '#f9fafb', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                  Email Address <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  required
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                    border: '2px solid #e5e7eb', background: '#f9fafb', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Phone & Village (2 Columns) */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="auth-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="9876543210"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                      border: '2px solid #e5e7eb', background: '#f9fafb', outline: 'none',
                      boxSizing: 'border-box', fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                    Village / Mandal
                  </label>
                  <input
                    type="text"
                    className="auth-input"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    placeholder="e.g. Jadcherla"
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                      border: '2px solid #e5e7eb', background: '#f9fafb', outline: 'none',
                      boxSizing: 'border-box', fontFamily: 'inherit'
                    }}
                  />
                </div>
              </div>

              {/* District Dropdown */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 5 }}>
                  District (Telangana)
                </label>
                <select
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                    border: '2px solid #e5e7eb', background: '#f9fafb', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit', color: '#1f2937', cursor: 'pointer'
                  }}
                >
                  {DISTRICTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Language Selection */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  Preferred Language
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => setLang(l.code)}
                      style={{
                        flex: 1,
                        padding: '9px 4px',
                        borderRadius: 10,
                        border: `2px solid ${lang === l.code ? '#059669' : '#e5e7eb'}`,
                        background: lang === l.code ? '#ecfdf5' : '#f9fafb',
                        color: lang === l.code ? '#059669' : '#374151',
                        fontSize: 13,
                        fontWeight: lang === l.code ? 800 : 600,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>
                    Password <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <span
                    onClick={() => setShowPass(!showPass)}
                    style={{ fontSize: 12, fontWeight: 700, color: '#059669', cursor: 'pointer', userSelect: 'none' }}
                  >
                    {showPass ? '🙈 Hide' : '👁️ Show'}
                  </span>
                </div>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="auth-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                    border: '2px solid #e5e7eb', background: '#f9fafb', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'inherit'
                  }}
                />

                {/* Strength Meter */}
                {password && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 4, height: 4 }}>
                      <div style={{
                        flex: 1, borderRadius: 2,
                        background: passStrength >= 1 ? (passStrength === 1 ? '#dc2626' : passStrength === 2 ? '#f59e0b' : '#059669') : '#e5e7eb'
                      }} />
                      <div style={{
                        flex: 1, borderRadius: 2,
                        background: passStrength >= 2 ? (passStrength === 2 ? '#f59e0b' : '#059669') : '#e5e7eb'
                      }} />
                      <div style={{
                        flex: 1, borderRadius: 2,
                        background: passStrength >= 3 ? '#059669' : '#e5e7eb'
                      }} />
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700, marginTop: 4,
                      color: passStrength === 1 ? '#dc2626' : passStrength === 2 ? '#d97706' : '#059669'
                    }}>
                      {passStrength === 1 ? 'Weak password' : passStrength === 2 ? 'Medium strength' : '✅ Strong password'}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Register */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '13px 0',
                  borderRadius: 12,
                  background: loading ? '#9ca3af' : '#059669',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 15,
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 3px 12px rgba(5,150,105,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                {loading && <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>}
                <span>Create Account 🌱</span>
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#6b7280' }}>
              Already registered?{' '}
              <span
                onClick={() => { setMode('login'); setError('') }}
                style={{ color: '#059669', fontWeight: 800, cursor: 'pointer' }}
              >
                Login here →
              </span>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div style={{
          textAlign: 'center',
          fontSize: 11,
          color: '#9ca3af',
          marginTop: 'auto',
          paddingTop: 20
        }}>
          Agri AI · Smart Farming Assistant · Telangana
        </div>
      </div>
    </div>
  )
}