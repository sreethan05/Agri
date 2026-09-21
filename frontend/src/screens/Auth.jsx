// src/screens/Auth.jsx — Faithful implementation of AgriConnect Auth Design
import { useState } from 'react'
import { registerUser, loginUser, saveAuth } from '../utils/api.js'

const DISTRICTS = [
  'Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam',
  'Nalgonda', 'Medak', 'Rangareddy', 'Adilabad', 'Mahabubnagar',
  'Siddipet', 'Suryapet', 'Mancherial', 'Jagtial', 'Kamareddy',
  'Bhadradri Kothagudem', 'Nagarkurnool', 'Wanaparthy'
]

// ── SVG Vector Icons ────────────────────────────────────────────────────────
const SvgLogoSprout = () => (
  <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
    <path d="M20 34V16" stroke="#ffffff" strokeWidth="3" strokeLinecap="round"/>
    <path d="M20 22C14 22 10 17 10 11C16 11 20 16 20 22Z" fill="#ffffff" fillOpacity="0.95"/>
    <path d="M20 20C26 20 30 15 30 9C24 9 20 14 20 20Z" fill="#ffffff" fillOpacity="0.95"/>
    <path d="M20 14C20 8 16 4 11 4C11 9 15 13 20 14Z" fill="#a7f3d0"/>
    <path d="M8 32H32" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.8"/>
  </svg>
)

const SvgUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
)

const SvgLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
)

const SvgMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const SvgPhone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const SvgEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const SvgEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
    <line x1="2" x2="22" y1="2" y2="22"/>
  </svg>
)

const SvgLeafSimple = ({ color = '#ffffff', size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
)

const SvgShieldLock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="12" fill="#1b4329" fillOpacity="0.12"/>
    <path d="M12 4L4 7v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V7l-8-3z" stroke="#1b4329" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9.5 12.5l2 2 3.5-3.5" stroke="#1b4329" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const SvgGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
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

  // Form Fields
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
        setError('Login succeeded, but no session token was received.')
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
      setError('Please provide your Email/Phone and Password.')
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
    <div className="agri-connect-page">
      <style>{`
        .agri-connect-page {
          min-height: 100vh;
          width: 100%;
          background: #f4f5f1;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          box-sizing: border-box;
          color: #1a2e22;
        }

        /* ── Master Card Container ── */
        .agri-card-wrapper {
          width: 100%;
          max-width: 1040px;
          min-height: 720px;
          background: #ffffff;
          border-radius: 36px;
          box-shadow: 0 25px 60px -15px rgba(27, 67, 41, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.04);
          display: flex;
          overflow: hidden;
          position: relative;
        }

        /* ── Left Hero Panel ── */
        .agri-hero-side {
          flex: 1.05;
          position: relative;
          background-image: url('/farm_hero.jpg');
          background-size: cover;
          background-position: center bottom;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 36px;
          color: #ffffff;
          box-sizing: border-box;
        }

        .agri-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.15) 0%,
            rgba(18, 48, 28, 0.35) 40%,
            rgba(12, 36, 20, 0.88) 100%
          );
          pointer-events: none;
        }

        .agri-hero-content-top {
          position: relative;
          z-index: 2;
        }

        .agri-hero-badge {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #fefce8;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
          margin-bottom: 24px;
        }

        .agri-hero-headline {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 42px;
          line-height: 1.15;
          color: #ffffff;
          margin: 0 0 14px;
          letter-spacing: -0.5px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .agri-hero-accent-line {
          width: 44px;
          height: 3.5px;
          background: #4ade80;
          border-radius: 2px;
          margin-bottom: 18px;
        }

        .agri-hero-subtext {
          font-size: 14px;
          line-height: 1.6;
          color: #f0fdf4;
          max-width: 380px;
          text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
          font-weight: 500;
        }

        /* Bottom 3 Glass Feature Cards */
        .agri-hero-glass-cards {
          position: relative;
          z-index: 2;
          background: rgba(18, 48, 28, 0.72);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 18px;
          padding: 16px 14px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .agri-glass-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .agri-glass-col:not(:last-child) {
          border-right: 1px solid rgba(255, 255, 255, 0.12);
          padding-right: 8px;
        }

        .agri-glass-icon {
          font-size: 20px;
          margin-bottom: 6px;
        }

        .agri-glass-title {
          font-size: 12px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 3px;
        }

        .agri-glass-desc {
          font-size: 10px;
          line-height: 1.35;
          color: #d1fae5;
          opacity: 0.9;
        }

        /* ── Right Auth Panel ── */
        .agri-auth-side {
          flex: 0.95;
          background: #fafaf8;
          padding: 40px 48px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
          position: relative;
        }

        /* Top Language Selector */
        .agri-lang-bar {
          display: flex;
          justify-content: flex-end;
          position: relative;
        }

        .agri-lang-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: all 0.2s;
        }

        .agri-lang-btn:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .agri-lang-dropdown {
          position: absolute;
          top: 36px;
          right: 0;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          z-index: 20;
          min-width: 120px;
        }

        .agri-lang-item {
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          cursor: pointer;
          transition: background 0.15s;
        }

        .agri-lang-item:hover {
          background: #f0fdf4;
          color: #166534;
        }

        /* Brand Identity Header */
        .agri-brand-center {
          text-align: center;
          margin-top: 10px;
          margin-bottom: 24px;
        }

        .agri-brand-icon-box {
          width: 54px;
          height: 54px;
          border-radius: 16px;
          background: linear-gradient(135deg, #1b4329 0%, #29603b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          box-shadow: 0 8px 18px rgba(27, 67, 41, 0.25);
        }

        .agri-brand-name {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.4px;
          color: #1b4329;
          margin: 0 0 4px;
        }

        .agri-brand-tagline {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.4px;
          margin: 0 0 12px;
        }

        .agri-brand-divider {
          width: 32px;
          height: 3px;
          background: #2e6943;
          border-radius: 2px;
          margin: 0 auto 20px;
        }

        .agri-auth-title {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 4px;
        }

        .agri-auth-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        /* Clean Mode Toggle Tabs */
        .agri-mode-tabs {
          display: flex;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 3px;
          margin: 16px auto 20px;
          max-width: 280px;
          border: 1px solid #e2e8f0;
        }

        .agri-mode-tab {
          flex: 1;
          padding: 8px 0;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          border-radius: 9px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .agri-mode-tab.active {
          background: #ffffff;
          color: #1b4329;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
        }

        /* Form Inputs */
        .agri-input-group {
          margin-bottom: 16px;
        }

        .agri-input-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .agri-input-left-icon {
          position: absolute;
          left: 16px;
          pointer-events: none;
          display: flex;
          align-items: center;
        }

        .agri-input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 46px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          font-size: 14px;
          color: #0f172a;
          outline: none;
          font-family: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }

        .agri-input:focus {
          border-color: #1b4329;
          box-shadow: 0 0 0 3px rgba(27, 67, 41, 0.12);
        }

        .agri-input::placeholder {
          color: #94a3b8;
          font-size: 13.5px;
        }

        .agri-eye-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        /* Checkbox & Forgot */
        .agri-form-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 13px;
        }

        .agri-checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          cursor: pointer;
          user-select: none;
          font-weight: 500;
        }

        .agri-checkbox-label input {
          accent-color: #1b4329;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .agri-forgot-link {
          color: #1b4329;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
        }

        .agri-forgot-link:hover {
          text-decoration: underline;
        }

        /* Primary Dark Forest Button */
        .agri-btn-primary {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 12px;
          background: #1b4329;
          color: #ffffff;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 14px rgba(27, 67, 41, 0.28);
          transition: background 0.15s, transform 0.1s;
          font-family: inherit;
        }

        .agri-btn-primary:hover:not(:disabled) {
          background: #143520;
        }

        .agri-btn-primary:disabled {
          background: #94a3b8;
          cursor: wait;
        }

        /* Divider */
        .agri-divider {
          display: flex;
          align-items: center;
          margin: 18px 0;
          color: #94a3b8;
          font-size: 12px;
        }

        .agri-divider::before,
        .agri-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e2e8f0;
        }

        .agri-divider span {
          padding: 0 12px;
        }

        /* Secondary Action Buttons */
        .agri-btn-secondary {
          width: 100%;
          height: 44px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          background: #ffffff;
          color: #1e293b;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
          transition: all 0.15s;
          font-family: inherit;
        }

        .agri-btn-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Bottom Security Badge */
        .agri-security-badge {
          background: #f4f6f0;
          border-radius: 14px;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 20px;
          position: relative;
          overflow: hidden;
        }

        .agri-security-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #1b4329;
          margin-bottom: 2px;
        }

        .agri-security-desc {
          font-size: 11px;
          color: #64748b;
          line-height: 1.35;
        }

        /* Error Notification */
        .agri-error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 10px 14px;
          color: #b91c1c;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        /* Responsive Stacking */
        @media (max-width: 860px) {
          .agri-connect-page {
            padding: 0;
            background: #ffffff;
          }
          .agri-card-wrapper {
            border-radius: 0;
            flex-direction: column;
            box-shadow: none;
            min-height: 100vh;
          }
          .agri-hero-side {
            min-height: 380px;
            padding: 30px 20px;
          }
          .agri-hero-headline {
            font-size: 32px;
          }
          .agri-auth-side {
            padding: 30px 20px;
          }
        }
      `}</style>

      {/* ── Main Master Dual-Panel Card ── */}
      <div className="agri-card-wrapper">

        {/* ── LEFT HERO PANEL ── */}
        <div className="agri-hero-side">
          <div className="agri-hero-overlay" />

          {/* Top content */}
          <div className="agri-hero-content-top">
            <div className="agri-hero-badge">
              <SvgLeafSimple color="#1b4329" size={22} />
            </div>

            <h1 className="agri-hero-headline">
              Growing<br />
              a better<br />
              tomorrow
            </h1>

            <div className="agri-hero-accent-line" />

            <p className="agri-hero-subtext">
              Smart solutions for modern farming. Manage, Monitor and Maximize your yield with technology.
            </p>
          </div>

          {/* Bottom 3 Glass Feature Cards */}
          <div className="agri-hero-glass-cards">
            <div className="agri-glass-col">
              <div className="agri-glass-icon">🍃</div>
              <div className="agri-glass-title">Smart Farming</div>
              <div className="agri-glass-desc">Data driven decisions</div>
            </div>

            <div className="agri-glass-col">
              <div className="agri-glass-icon">🌱</div>
              <div className="agri-glass-title">Crop Health</div>
              <div className="agri-glass-desc">Monitor & protect your crops</div>
            </div>

            <div className="agri-glass-col">
              <div className="agri-glass-icon">📈</div>
              <div className="agri-glass-title">Better Yield</div>
              <div className="agri-glass-desc">Increase productivity sustainably</div>
            </div>
          </div>
        </div>

        {/* ── RIGHT AUTHENTICATION PANEL ── */}
        <div className="agri-auth-side">

          {/* Language Selector Bar */}
          <div className="agri-lang-bar">
            <button
              type="button"
              className="agri-lang-btn"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
            >
              <span>🌐</span>
              <span>{selectedLang}</span>
              <span style={{ fontSize: 10 }}>▼</span>
            </button>

            {langMenuOpen && (
              <div className="agri-lang-dropdown">
                {['English', 'తెలుగు', 'हिंदी'].map(l => (
                  <div
                    key={l}
                    className="agri-lang-item"
                    onClick={() => { setSelectedLang(l); setLangMenuOpen(false) }}
                  >
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Brand Identity Header */}
          <div className="agri-brand-center">
            <div className="agri-brand-icon-box">
              <SvgLogoSprout />
            </div>

            <h2 className="agri-brand-name">AgriConnect</h2>
            <div className="agri-brand-tagline">Connect. Cultivate. Thrive.</div>
            <div className="agri-brand-divider" />

            <h3 className="agri-auth-title">
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h3>
            <p className="agri-auth-subtitle">
              {mode === 'login' ? 'Login to continue your journey' : 'Join thousands of farmers optimizing yields'}
            </p>

            {/* Seamless Mode Switcher Pills */}
            <div className="agri-mode-tabs">
              <button
                type="button"
                className={`agri-mode-tab ${mode === 'login' ? 'active' : ''}`}
                onClick={() => { setMode('login'); setError('') }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`agri-mode-tab ${mode === 'register' ? 'active' : ''}`}
                onClick={() => { setMode('register'); setError('') }}
              >
                Register
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="agri-error-banner">
              <span>⚠️ {error}</span>
              <button
                onClick={() => setError('')}
                style={{ background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontWeight: 800 }}
              >
                ×
              </button>
            </div>
          )}

          {/* ── FORM ── */}
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {/* Register: Full Name */}
            {mode === 'register' && (
              <div className="agri-input-group">
                <div className="agri-input-box">
                  <span className="agri-input-left-icon"><SvgUser /></span>
                  <input
                    type="text"
                    className="agri-input"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email or Phone */}
            <div className="agri-input-group">
              <div className="agri-input-box">
                <span className="agri-input-left-icon">
                  {mode === 'login' ? <SvgUser /> : <SvgMail />}
                </span>
                <input
                  type="text"
                  className="agri-input"
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  placeholder="Email or Phone Number"
                  required
                />
              </div>
            </div>

            {/* Register: District Dropdown */}
            {mode === 'register' && (
              <div className="agri-input-group">
                <div className="agri-input-box">
                  <span className="agri-input-left-icon">📍</span>
                  <select
                    className="agri-input"
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
            <div className="agri-input-group">
              <div className="agri-input-box">
                <span className="agri-input-left-icon"><SvgLock /></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="agri-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="agri-eye-btn"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <SvgEyeOff /> : <SvgEye />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password (Login mode) */}
            {mode === 'login' && (
              <div className="agri-form-row">
                <label className="agri-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span>Remember me</span>
                </label>

                <span
                  className="agri-forgot-link"
                  onClick={() => alert('For instant testing, please click "⚡ One-Click Demo Login" below!')}
                >
                  Forgot Password?
                </span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              className="agri-btn-primary"
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
                  <SvgLeafSimple color="#ffffff" size={17} />
                </>
              )}
            </button>
          </form>

          {/* Or Divider */}
          <div className="agri-divider">
            <span>or</span>
          </div>

          {/* Alternative Quick Sign-In Options */}
          <div>
            <button
              type="button"
              className="agri-btn-secondary"
              onClick={handleQuickDemo}
            >
              <SvgGoogle />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              className="agri-btn-secondary"
              onClick={handleQuickDemo}
              style={{ color: '#1b4329' }}
            >
              <SvgLeafSimple color="#1b4329" size={16} />
              <span>Continue with Demo Account (1-Click)</span>
            </button>
          </div>

          {/* Security Guarantee Badge */}
          <div className="agri-security-badge">
            <SvgShieldLock />
            <div>
              <div className="agri-security-title">Your data is secure with us</div>
              <div className="agri-security-desc">We use advanced encryption to protect your information.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}