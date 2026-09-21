// src/screens/Auth.jsx — True Full-Screen, Zero-Scroll AgriConnect Auth Design
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
  <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
    <path d="M20 34V16" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    <path d="M20 22C14 22 10 17 10 11C16 11 20 16 20 22Z" fill="#ffffff" fillOpacity="0.95"/>
    <path d="M20 20C26 20 30 15 30 9C24 9 20 14 20 20Z" fill="#ffffff" fillOpacity="0.95"/>
    <path d="M20 14C20 8 16 4 11 4C11 9 15 13 20 14Z" fill="#a7f3d0"/>
    <path d="M8 32H32" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8"/>
  </svg>
)

const SvgUser = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const SvgLock = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const SvgMail = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const SvgEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const SvgEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <rect width="24" height="24" rx="12" fill="#1b4329" fillOpacity="0.12"/>
    <path d="M12 4L4 7v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V7l-8-3z" stroke="#1b4329" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 12.5l2 2 3.5-3.5" stroke="#1b4329" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SvgGoogle = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
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

  // Form inputs
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
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again or use Demo Login.')
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
      alert('Registration successful! You can now log in.')
      setMode('login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration encountered an error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fs-auth-root">
      <style>{`
        /* True Full-Screen Zero-Scroll Rules */
        html, body {
          height: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
        }

        .fs-auth-root {
          height: 100vh;
          width: 100vw;
          margin: 0;
          padding: 0;
          display: flex;
          overflow: hidden;
          background: #fafaf8;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1a2e22;
          box-sizing: border-box;
        }

        /* ── Left Hero Panel (52% width, 100vh height) ── */
        .fs-hero {
          flex: 1.1;
          height: 100vh;
          position: relative;
          background-image: url('/farm_hero.jpg');
          background-size: cover;
          background-position: center bottom;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(24px, 4vh, 48px) clamp(24px, 4vw, 52px);
          box-sizing: border-box;
          color: #ffffff;
          overflow: hidden;
        }

        .fs-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.12) 0%,
            rgba(16, 44, 25, 0.3) 40%,
            rgba(10, 32, 18, 0.88) 100%
          );
          pointer-events: none;
        }

        .fs-hero-top {
          position: relative;
          z-index: 2;
        }

        .fs-hero-badge {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #fefce8;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
          margin-bottom: clamp(12px, 2.5vh, 26px);
        }

        .fs-hero-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: clamp(32px, 4.2vh, 46px);
          line-height: 1.12;
          color: #ffffff;
          margin: 0 0 12px;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }

        .fs-hero-line {
          width: 42px;
          height: 3.5px;
          background: #4ade80;
          border-radius: 2px;
          margin-bottom: clamp(12px, 2vh, 18px);
        }

        .fs-hero-desc {
          font-size: clamp(12.5px, 1.6vh, 14.5px);
          line-height: 1.55;
          color: #f0fdf4;
          max-width: 400px;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
          font-weight: 500;
        }

        /* 3 Glass Bottom Cards */
        .fs-glass-cards {
          position: relative;
          z-index: 2;
          background: rgba(18, 48, 28, 0.72);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 16px;
          padding: clamp(10px, 1.6vh, 14px) 12px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .fs-glass-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .fs-glass-item:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.12);
          padding-right: 6px;
        }

        .fs-glass-icon {
          font-size: 18px;
          margin-bottom: 4px;
        }

        .fs-glass-h {
          font-size: 11.5px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 2px;
        }

        .fs-glass-p {
          font-size: 9.5px;
          line-height: 1.3;
          color: #d1fae5;
          opacity: 0.9;
        }

        /* ── Right Auth Panel (48% width, 100vh height, Zero Scroll) ── */
        .fs-auth {
          flex: 0.9;
          height: 100vh;
          background: #fafaf8;
          padding: clamp(16px, 2.5vh, 28px) clamp(24px, 4vw, 52px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
        }

        /* Top Bar with Language */
        .fs-top-bar {
          display: flex;
          justify-content: flex-end;
          position: relative;
        }

        .fs-lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.15s;
        }

        .fs-lang-menu {
          position: absolute;
          top: 32px;
          right: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          z-index: 30;
          min-width: 110px;
        }

        .fs-lang-option {
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
        }

        .fs-lang-option:hover {
          background: #f0fdf4;
          color: #166534;
        }

        /* Brand & Headers */
        .fs-brand-block {
          text-align: center;
          margin: 2px 0 10px;
        }

        .fs-brand-icon {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1b4329 0%, #29603b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
          box-shadow: 0 6px 16px rgba(27, 67, 41, 0.22);
        }

        .fs-brand-name {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.4px;
          color: #1b4329;
          margin: 0 0 2px;
        }

        .fs-brand-tagline {
          font-size: 11.5px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.3px;
          margin: 0 0 8px;
        }

        .fs-brand-divider {
          width: 28px;
          height: 2.5px;
          background: #2e6943;
          border-radius: 2px;
          margin: 0 auto 12px;
        }

        .fs-title {
          font-size: clamp(18px, 2.2vh, 22px);
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 3px;
        }

        .fs-subtitle {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 10px;
        }

        /* Mode Switcher Tabs */
        .fs-mode-tabs {
          display: flex;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 3px;
          margin: 0 auto 12px;
          max-width: 240px;
          border: 1px solid #e2e8f0;
        }

        .fs-mode-tab {
          flex: 1;
          padding: 6px 0;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fs-mode-tab.active {
          background: #ffffff;
          color: #1b4329;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
        }

        /* Inputs */
        .fs-input-group {
          margin-bottom: 10px;
        }

        .fs-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .fs-input-icon {
          position: absolute;
          left: 14px;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .fs-input {
          width: 100%;
          height: clamp(40px, 4.6vh, 46px);
          padding: 0 14px 0 42px;
          border: 1.5px solid #e2e8f0;
          border-radius: 11px;
          background: #ffffff;
          font-size: 13.5px;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }

        .fs-input:focus {
          border-color: #1b4329;
          box-shadow: 0 0 0 3px rgba(27, 67, 41, 0.12);
        }

        .fs-input::placeholder {
          color: #94a3b8;
          font-size: 13px;
        }

        .fs-eye-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        /* Checkbox row */
        .fs-extra-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 12px;
        }

        .fs-checkbox {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          cursor: pointer;
          user-select: none;
          font-weight: 500;
        }

        .fs-checkbox input {
          accent-color: #1b4329;
          width: 15px;
          height: 15px;
          cursor: pointer;
        }

        .fs-forgot-link {
          color: #1b4329;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
        }

        /* Primary Action Button */
        .fs-btn-primary {
          width: 100%;
          height: clamp(40px, 4.8vh, 46px);
          border: none;
          border-radius: 11px;
          background: #1b4329;
          color: #ffffff;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 3px 12px rgba(27, 67, 41, 0.25);
          transition: background 0.15s, transform 0.1s;
          font-family: inherit;
        }

        .fs-btn-primary:hover:not(:disabled) {
          background: #143520;
        }

        .fs-btn-primary:disabled {
          background: #94a3b8;
          cursor: wait;
        }

        /* Divider */
        .fs-divider {
          display: flex;
          align-items: center;
          margin: 10px 0;
          color: #94a3b8;
          font-size: 11.5px;
        }

        .fs-divider::before,
        .fs-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .fs-divider span {
          padding: 0 10px;
        }

        /* Secondary Action Buttons */
        .fs-btn-secondary {
          width: 100%;
          height: clamp(38px, 4.3vh, 42px);
          border: 1.5px solid #e2e8f0;
          border-radius: 11px;
          background: #ffffff;
          color: #1e293b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 8px;
          transition: all 0.15s;
          font-family: inherit;
        }

        .fs-btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Security Card */
        .fs-security-card {
          background: #f4f6f0;
          border-radius: 12px;
          padding: 9px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 6px;
        }

        .fs-sec-title {
          font-size: 12px;
          font-weight: 700;
          color: #1b4329;
          margin-bottom: 1px;
        }

        .fs-sec-desc {
          font-size: 10.5px;
          color: #64748b;
          line-height: 1.3;
        }

        /* Error Banner */
        .fs-error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 9px;
          padding: 8px 12px;
          color: #b91c1c;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Responsive on smaller mobile screens */
        @media (max-width: 800px) {
          .fs-auth-root {
            flex-direction: column;
            overflow-y: auto !important;
            height: auto;
          }
          .fs-hero {
            display: none;
          }
          .fs-auth {
            height: 100vh;
            padding: 20px 18px;
          }
        }
      `}</style>

      {/* ── LEFT HERO PANEL (Full Viewport Height) ── */}
      <div className="fs-hero">
        <div className="fs-hero-overlay" />

        {/* Top Content */}
        <div className="fs-hero-top">
          <div className="fs-hero-badge">
            <SvgLeafSimple color="#1b4329" size={20} />
          </div>

          <h1 className="fs-hero-title">
            Growing<br />
            a better<br />
            tomorrow
          </h1>

          <div className="fs-hero-line" />

          <p className="fs-hero-desc">
            Smart solutions for modern farming. Manage, Monitor and Maximize your yield with technology.
          </p>
        </div>

        {/* Bottom 3 Glass Feature Cards */}
        <div className="fs-glass-cards">
          <div className="fs-glass-item">
            <div className="fs-glass-icon">🍃</div>
            <div className="fs-glass-h">Smart Farming</div>
            <div className="fs-glass-p">Data driven decisions</div>
          </div>

          <div className="fs-glass-item">
            <div className="fs-glass-icon">🌱</div>
            <div className="fs-glass-h">Crop Health</div>
            <div className="fs-glass-p">Monitor & protect crops</div>
          </div>

          <div className="fs-glass-item">
            <div className="fs-glass-icon">📈</div>
            <div className="fs-glass-h">Better Yield</div>
            <div className="fs-glass-p">Sustainable increase</div>
          </div>
        </div>
      </div>

      {/* ── RIGHT AUTH PANEL (Full Viewport Height, No Scroll) ── */}
      <div className="fs-auth">

        {/* Top Language Bar */}
        <div className="fs-top-bar">
          <button
            type="button"
            className="fs-lang-btn"
            onClick={() => setLangMenuOpen(!langMenuOpen)}
          >
            <span>🌐</span>
            <span>{selectedLang}</span>
            <span style={{ fontSize: 9 }}>▼</span>
          </button>

          {langMenuOpen && (
            <div className="fs-lang-menu">
              {['English', 'తెలుగు', 'हिंदी'].map(l => (
                <div
                  key={l}
                  className="fs-lang-option"
                  onClick={() => { setSelectedLang(l); setLangMenuOpen(false) }}
                >
                  {l}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Brand & Mode Switcher */}
        <div className="fs-brand-block">
          <div className="fs-brand-icon">
            <SvgLogoSprout />
          </div>

          <h2 className="fs-brand-name">AgriConnect</h2>
          <div className="fs-brand-tagline">Connect. Cultivate. Thrive.</div>
          <div className="fs-brand-divider" />

          <h3 className="fs-title">
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h3>
          <p className="fs-subtitle">
            {mode === 'login' ? 'Login to continue your journey' : 'Join our smart farming network'}
          </p>

          {/* Mode Tabs */}
          <div className="fs-mode-tabs">
            <button
              type="button"
              className={`fs-mode-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError('') }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`fs-mode-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => { setMode('register'); setError('') }}
            >
              Register
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="fs-error-banner">
            <span>⚠️ {error}</span>
            <button
              onClick={() => setError('')}
              style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 800 }}
            >
              ×
            </button>
          </div>
        )}

        {/* ── AUTH FORM ── */}
        <form onSubmit={mode === 'login' ? handleLogin : handleRegister} style={{ margin: '0' }}>
          {/* Register: Full Name */}
          {mode === 'register' && (
            <div className="fs-input-group">
              <div className="fs-input-wrap">
                <span className="fs-input-icon"><SvgUser /></span>
                <input
                  type="text"
                  className="fs-input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Full Name"
                  required
                />
              </div>
            </div>
          )}

          {/* Email or Phone */}
          <div className="fs-input-group">
            <div className="fs-input-wrap">
              <span className="fs-input-icon">
                {mode === 'login' ? <SvgUser /> : <SvgMail />}
              </span>
              <input
                type="text"
                className="fs-input"
                value={emailOrPhone}
                onChange={e => setEmailOrPhone(e.target.value)}
                placeholder="Email or Phone Number"
                required
              />
            </div>
          </div>

          {/* Register: District Dropdown */}
          {mode === 'register' && (
            <div className="fs-input-group">
              <div className="fs-input-wrap">
                <span className="fs-input-icon">📍</span>
                <select
                  className="fs-input"
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
          <div className="fs-input-group">
            <div className="fs-input-wrap">
              <span className="fs-input-icon"><SvgLock /></span>
              <input
                type={showPass ? 'text' : 'password'}
                className="fs-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="fs-eye-btn"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <SvgEyeOff /> : <SvgEye />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          {mode === 'login' && (
            <div className="fs-extra-row">
              <label className="fs-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <span
                className="fs-forgot-link"
                onClick={() => alert('Use 1-Click Demo Login below for instant testing!')}
              >
                Forgot Password?
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="fs-btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                <span>Signing in...</span>
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
        <div className="fs-divider">
          <span>or</span>
        </div>

        {/* Quick Login Options */}
        <div>
          <button
            type="button"
            className="fs-btn-secondary"
            onClick={handleQuickDemo}
          >
            <SvgGoogle />
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            className="fs-btn-secondary"
            onClick={handleQuickDemo}
            style={{ color: '#1b4329' }}
          >
            <SvgLeafSimple color="#1b4329" size={15} />
            <span>Continue with Demo Account (1-Click)</span>
          </button>
        </div>

        {/* Security Badge Card */}
        <div className="fs-security-card">
          <SvgShieldLock />
          <div>
            <div className="fs-sec-title">Your data is secure with us</div>
            <div className="fs-sec-desc">We use advanced encryption to protect your information.</div>
          </div>
        </div>

      </div>
    </div>
  )
}