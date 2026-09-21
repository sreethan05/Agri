// src/screens/Auth.jsx — Centered Card, No-Scroll, Exact Match to Reference
import { useState } from 'react'
import { registerUser, loginUser, saveAuth } from '../utils/api.js'

const DISTRICTS = [
  'Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam',
  'Nalgonda', 'Medak', 'Rangareddy', 'Adilabad', 'Mahabubnagar',
  'Siddipet', 'Suryapet', 'Mancherial', 'Jagtial', 'Kamareddy',
  'Bhadradri Kothagudem', 'Nagarkurnool', 'Wanaparthy'
]

// ── SVG Icons ───────────────────────────────────────────────────────────────
const SvgLogoSprout = () => (
  <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
    <path d="M20 34V16" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    <path d="M20 22C14 22 10 17 10 11C16 11 20 16 20 22Z" fill="#ffffff" fillOpacity="0.95"/>
    <path d="M20 20C26 20 30 15 30 9C24 9 20 14 20 20Z" fill="#ffffff" fillOpacity="0.95"/>
    <path d="M20 14C20 8 16 4 11 4C11 9 15 13 20 14Z" fill="#a7f3d0"/>
    <path d="M8 32H32" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8"/>
  </svg>
)

const SvgUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const SvgLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const SvgEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const SvgEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
)

const SvgLeafSimple = ({ color = '#ffffff', size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
)

const SvgShieldLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <rect width="24" height="24" rx="6" fill="#1b4329" fillOpacity="0.1"/>
    <path d="M12 5L5 8v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V8l-7-3z" stroke="#1b4329" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 12l2 2 3.5-3.5" stroke="#1b4329" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SvgGoogle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/>
    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
  </svg>
)

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [selectedLang, setSelectedLang] = useState('English')
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  // Inputs
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [district, setDistrict] = useState('Hyderabad')

  // One-Click Demo Login
  const handleQuickDemo = async () => {
    setEmailOrPhone('test@agri.ai')
    setPassword('test123456')
    setLoading(true)
    setError('')
    try {
      const res = await loginUser({ email: 'test@agri.ai', password: 'test123456' })
      if (res.access_token) {
        saveAuth(res.access_token, res.refresh_token, res.user)
        onAuthSuccess(res.user)
      } else {
        setError('Login succeeded, but token missing.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo login failed. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Login Submission
  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    if (!emailOrPhone.trim() || !password) {
      setError('Please provide Email/Phone and Password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const cleanEmail = emailOrPhone.trim().includes('@')
        ? emailOrPhone.trim()
        : `${emailOrPhone.trim()}@agri.ai`

      const res = await loginUser({ email: cleanEmail, password })
      if (res.access_token) {
        saveAuth(res.access_token, res.refresh_token, res.user)
        onAuthSuccess(res.user)
      } else {
        setError('Login successful, but token not found.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Try test@agri.ai / test123456')
    } finally {
      setLoading(false)
    }
  }

  // Handle Register Submission
  const handleRegister = async (e) => {
    if (e) e.preventDefault()
    if (!emailOrPhone.trim() || !password || !fullName.trim()) {
      setError('Full Name, Email/Phone, and Password are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const cleanEmail = emailOrPhone.trim().includes('@')
        ? emailOrPhone.trim()
        : `${emailOrPhone.trim()}@agri.ai`

      await registerUser({
        email: cleanEmail,
        password,
        full_name: fullName.trim(),
        phone: emailOrPhone.trim(),
        district,
        preferred_lang: selectedLang === 'తెలుగు' ? 'te' : selectedLang === 'हिंदी' ? 'hi' : 'en'
      })
      alert('Account registered successfully! Please log in.')
      setMode('login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration encountered an error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card-page-wrap">
      <style>{`
        /* Zero Scroll Master Container */
        html, body, #root {
          height: 100vh !important;
          width: 100vw !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        .card-page-wrap {
          height: 100vh;
          width: 100vw;
          background: #eaebe6;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          overflow: hidden;
        }

        /* ── Centered Rounded Card (Fits exactly without scroll) ── */
        .card-container {
          width: 100%;
          max-width: 960px;
          height: min(650px, 92vh);
          background: #ffffff;
          border-radius: 28px;
          box-shadow: 0 20px 50px -10px rgba(27, 67, 41, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04);
          display: flex;
          overflow: hidden;
        }

        /* ── Left Side (Farm Hero) ── */
        .card-left {
          flex: 1.05;
          height: 100%;
          position: relative;
          background-image: url('/farm_hero.jpg');
          background-size: cover;
          background-position: center bottom;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 28px 26px;
          box-sizing: border-box;
          color: #ffffff;
          overflow: hidden;
        }

        .card-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.1) 0%,
            rgba(18, 48, 28, 0.28) 40%,
            rgba(10, 32, 18, 0.86) 100%
          );
          pointer-events: none;
        }

        .card-left-top {
          position: relative;
          z-index: 2;
        }

        .card-left-badge {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #fefce8;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
          margin-bottom: 16px;
        }

        .card-left-heading {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 34px;
          line-height: 1.12;
          color: #ffffff;
          margin: 0 0 10px;
          letter-spacing: -0.4px;
          text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
        }

        .card-left-line {
          width: 38px;
          height: 3px;
          background: #4ade80;
          border-radius: 2px;
          margin-bottom: 12px;
        }

        .card-left-sub {
          font-size: 12.5px;
          line-height: 1.5;
          color: #f0fdf4;
          max-width: 320px;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
          font-weight: 500;
        }

        /* 3 Bottom Glass Feature Cards */
        .card-left-glass {
          position: relative;
          z-index: 2;
          background: rgba(18, 48, 28, 0.72);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 14px;
          padding: 10px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          text-align: center;
        }

        .glass-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .glass-col:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.12);
          padding-right: 4px;
        }

        .glass-icon {
          font-size: 16px;
          margin-bottom: 3px;
        }

        .glass-title {
          font-size: 11px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 1px;
        }

        .glass-desc {
          font-size: 9px;
          line-height: 1.25;
          color: #d1fae5;
          opacity: 0.9;
        }

        /* ── Right Side (Form) ── */
        .card-right {
          flex: 0.95;
          height: 100%;
          background: #fafaf8;
          padding: 20px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
        }

        /* Top Language Bar */
        .top-lang-wrap {
          display: flex;
          justify-content: flex-end;
          position: relative;
        }

        .btn-lang {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 11.5px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
        }

        .dropdown-lang {
          position: absolute;
          top: 28px;
          right: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          z-index: 30;
          min-width: 100px;
        }

        .dropdown-lang-opt {
          padding: 6px 10px;
          font-size: 11.5px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
        }

        .dropdown-lang-opt:hover {
          background: #f0fdf4;
          color: #166534;
        }

        /* Brand Block */
        .brand-center {
          text-align: center;
          margin: 0 0 6px;
        }

        .brand-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #1b4329 0%, #29603b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 6px;
          box-shadow: 0 4px 12px rgba(27, 67, 41, 0.2);
        }

        .brand-name {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.3px;
          color: #1b4329;
          margin: 0 0 2px;
        }

        .brand-tagline {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.3px;
          margin: 0 0 6px;
        }

        .brand-dash {
          width: 26px;
          height: 2px;
          background: #2e6943;
          border-radius: 2px;
          margin: 0 auto 8px;
        }

        .auth-heading {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 2px;
        }

        .auth-sub {
          font-size: 11.5px;
          color: #64748b;
          margin: 0 0 8px;
        }

        /* Clean Mode Switcher */
        .mode-switch-bar {
          display: flex;
          background: #f1f5f9;
          border-radius: 8px;
          padding: 2px;
          margin: 0 auto 8px;
          max-width: 220px;
          border: 1px solid #e2e8f0;
        }

        .mode-switch-btn {
          flex: 1;
          padding: 5px 0;
          border: none;
          background: transparent;
          font-size: 11.5px;
          font-weight: 700;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
        }

        .mode-switch-btn.active {
          background: #ffffff;
          color: #1b4329;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }

        /* Inputs */
        .field-group {
          margin-bottom: 8px;
        }

        .field-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon-left {
          position: absolute;
          left: 12px;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .field-input {
          width: 100%;
          height: 38px;
          padding: 0 12px 0 36px;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          background: #ffffff;
          font-size: 13px;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          transition: border-color 0.15s;
        }

        .field-input:focus {
          border-color: #1b4329;
          box-shadow: 0 0 0 2px rgba(27, 67, 41, 0.12);
        }

        .field-input::placeholder {
          color: #94a3b8;
          font-size: 12.5px;
        }

        .field-eye-btn {
          position: absolute;
          right: 10px;
          background: none;
          border: none;
          padding: 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        /* Checkbox row */
        .action-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 11.5px;
        }

        .checkbox-lbl {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          cursor: pointer;
          user-select: none;
          font-weight: 500;
        }

        .checkbox-lbl input {
          accent-color: #1b4329;
          width: 14px;
          height: 14px;
          cursor: pointer;
        }

        .forgot-link {
          color: #1b4329;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
        }

        /* Big Dark Button */
        .btn-main {
          width: 100%;
          height: 40px;
          border: none;
          border-radius: 10px;
          background: #1b4329;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 3px 10px rgba(27, 67, 41, 0.22);
          transition: background 0.15s;
          font-family: inherit;
        }

        .btn-main:hover:not(:disabled) {
          background: #143520;
        }

        .btn-main:disabled {
          background: #94a3b8;
          cursor: wait;
        }

        /* Divider */
        .div-sep {
          display: flex;
          align-items: center;
          margin: 8px 0;
          color: #94a3b8;
          font-size: 11px;
        }

        .div-sep::before,
        .div-sep::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .div-sep span {
          padding: 0 8px;
        }

        /* Secondary Buttons */
        .btn-sub {
          width: 100%;
          height: 36px;
          border: 1.5px solid #e2e8f0;
          border-radius: 9px;
          background: #ffffff;
          color: #1e293b;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 6px;
          transition: all 0.15s;
          font-family: inherit;
        }

        .btn-sub:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Security Box */
        .sec-box {
          background: #f4f6f0;
          border-radius: 10px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }

        .sec-title {
          font-size: 11.5px;
          font-weight: 700;
          color: #1b4329;
          margin-bottom: 1px;
        }

        .sec-desc {
          font-size: 10px;
          color: #64748b;
          line-height: 1.25;
        }

        /* Error alert */
        .err-pill {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 6px 10px;
          color: #b91c1c;
          font-size: 11.5px;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Responsive */
        @media (max-width: 780px) {
          .card-page-wrap {
            padding: 0;
            background: #fafaf8;
          }
          .card-container {
            border-radius: 0;
            height: 100vh;
            max-width: 100vw;
            box-shadow: none;
          }
          .card-left {
            display: none;
          }
          .card-right {
            padding: 16px;
          }
        }
      `}</style>

      {/* ── Center Master Card ── */}
      <div className="card-container">

        {/* ── Left Hero Side ── */}
        <div className="card-left">
          <div className="card-left-overlay" />

          {/* Top content */}
          <div className="card-left-top">
            <div className="card-left-badge">
              <SvgLeafSimple color="#1b4329" size={18} />
            </div>

            <h1 className="card-left-heading">
              Growing<br />
              a better<br />
              tomorrow
            </h1>

            <div className="card-left-line" />

            <p className="card-left-sub">
              Smart solutions for modern farming. Manage, Monitor and Maximize your yield with technology.
            </p>
          </div>

          {/* 3 Bottom Glass Cards */}
          <div className="card-left-glass">
            <div className="glass-col">
              <div className="glass-icon">🍃</div>
              <div className="glass-title">Smart Farming</div>
              <div className="glass-desc">Data driven decisions</div>
            </div>

            <div className="glass-col">
              <div className="glass-icon">🌱</div>
              <div className="glass-title">Crop Health</div>
              <div className="glass-desc">Monitor & protect crops</div>
            </div>

            <div className="glass-col">
              <div className="glass-icon">📈</div>
              <div className="glass-title">Better Yield</div>
              <div className="glass-desc">Increase productivity</div>
            </div>
          </div>
        </div>

        {/* ── Right Form Side ── */}
        <div className="card-right">

          {/* Top Language Bar */}
          <div className="top-lang-wrap">
            <button
              type="button"
              className="btn-lang"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
            >
              <span>🌐</span>
              <span>{selectedLang}</span>
              <span style={{ fontSize: 9 }}>▼</span>
            </button>

            {langMenuOpen && (
              <div className="dropdown-lang">
                {['English', 'తెలుగు', 'हिंदी'].map(l => (
                  <div
                    key={l}
                    className="dropdown-lang-opt"
                    onClick={() => { setSelectedLang(l); setLangMenuOpen(false) }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brand Identity */}
          <div className="brand-center">
            <div className="brand-icon-box">
              <SvgLogoSprout />
            </div>

            <h2 className="brand-name">AgriConnect</h2>
            <div className="brand-tagline">Connect. Cultivate. Thrive.</div>
            <div className="brand-dash" />

            <h3 className="auth-heading">
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h3>
            <p className="auth-sub">
              {mode === 'login' ? 'Login to continue your journey' : 'Join our smart farming network'}
            </p>

            {/* Mode Switcher */}
            <div className="mode-switch-bar">
              <button
                type="button"
                className={`mode-switch-btn ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError('') }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`mode-switch-btn ${mode === 'register' ? 'active' : ''}`}
                onClick={() => { setMode('register'); setError('') }}
              >
                Register
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="err-pill">
              <span>⚠️ {error}</span>
              <button
                onClick={() => setError('')}
                style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 800 }}
              >
                ×
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ margin: 0 }}>
            {/* Register: Full Name */}
            {mode === 'register' && (
              <div className="field-group">
                <div className="field-wrap">
                  <span className="field-icon-left"><SvgUser /></span>
                  <input
                    type="text"
                    className="field-input"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email or Phone */}
            <div className="field-group">
              <div className="field-wrap">
                <span className="field-icon-left"><SvgUser /></span>
                <input
                  type="text"
                  className="field-input"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  placeholder="Email or Phone Number"
                  required
                />
              </div>
            </div>

            {/* Register: District Dropdown */}
            {mode === 'register' && (
              <div className="field-group">
                <div className="field-wrap">
                  <span className="field-icon-left">📍</span>
                  <select
                    className="field-input"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    {DISTRICTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Password */}
            <div className="field-group">
              <div className="field-wrap">
                <span className="field-icon-left"><SvgLock /></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="field-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="field-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <SvgEyeOff /> : <SvgEye />}
                </button>
              </div>
            </div>

            {/* Remember Me / Forgot Password */}
            {mode === 'login' && (
              <div className="action-row">
                <label className="checkbox-lbl">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <span
                  className="forgot-link"
                  onClick={() => alert('For instant login, click "Continue with Demo Account" below!')}
                >
                  Forgot Password?
                </span>
              </div>
            )}

            {/* Big Dark Action Button */}
            <button
              type="submit"
              className="btn-main"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
                  <SvgLeafSimple color="#ffffff" size={15} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="div-sep">
            <span>or</span>
          </div>

          {/* Alternative Buttons */}
          <div>
            <button
              type="button"
              className="btn-sub"
              onClick={handleQuickDemo}
            >
              <SvgGoogle />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              className="btn-sub"
              onClick={handleQuickDemo}
              style={{ color: '#1b4329' }}
            >
              <SvgLeafSimple color="#1b4329" size={14} />
              <span>Continue with Demo Account (1-Click)</span>
            </button>
          </div>

          {/* Security Box */}
          <div className="sec-box">
            <SvgShieldLock />
            <div>
              <div className="sec-title">Your data is secure with us</div>
              <div className="sec-desc">We use advanced encryption to protect your information.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}