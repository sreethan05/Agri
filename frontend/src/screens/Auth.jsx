// src/screens/Auth.jsx — Supabase Auth version (no manual OTP)
import { useState } from 'react'
import { registerUser, loginUser, saveAuth } from '../utils/api.js'

const DISTRICTS = [
  'Hyderabad','Warangal','Karimnagar','Nizamabad','Khammam',
  'Nalgonda','Medak','Rangareddy','Adilabad','Mahabubnagar'
]
const LANGS = [
  { code:'te', label:'తెలుగు' },
  { code:'hi', label:'हिंदी'  },
  { code:'en', label:'English' },
]

function Input({ label, type='text', value, onChange, placeholder='', required=false }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:5 }}>
        {label}{required && <span style={{ color:'#dc2626' }}> *</span>}
      </label>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width:'100%', padding:'11px 14px', borderRadius:10, fontSize:15,
          border:`2px solid ${focused ? '#059669' : '#e5e7eb'}`,
          outline:'none', boxSizing:'border-box',
          background:'#f9fafb', fontFamily:'inherit', transition:'border-color .2s',
        }}
      />
    </div>
  )
}

function Btn({ children, onClick, loading, outline=false }) {
  return (
    <button onClick={onClick} disabled={loading} style={{
      width:'100%', padding:'13px 0', borderRadius:50,
      background: outline ? 'transparent' : (loading ? '#9ca3af' : '#059669'),
      color: outline ? '#059669' : '#fff',
      border: `2px solid ${loading ? '#9ca3af' : '#059669'}`,
      fontSize:15, fontWeight:800, cursor: loading ? 'wait' : 'pointer',
      fontFamily:'inherit', display:'flex', alignItems:'center',
      justifyContent:'center', gap:8, transition:'all .2s',
    }}>
      {loading && (
        <span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span>
      )}
      {children}
    </button>
  )
}

export default function Auth({ onAuthSuccess }) {
  const [mode,     setMode]     = useState('login')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [showPass, setShowPass] = useState(false)

  // Shared
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // Register only
  const [fullName, setFullName] = useState('')
  const [phone,    setPhone]    = useState('')
  const [village,  setVillage]  = useState('')
  const [district, setDistrict] = useState('Hyderabad')
  const [lang,     setLang]     = useState('te')

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
        const res = await loginUser({ email, password })
        console.log("Response from server:", res)

    // Ensure these keys (access_token, user) match exactly what your Python backend sends
        if (res.access_token) {
            saveAuth(res.access_token, res.refresh_token, res.user)
            onAuthSuccess(res.user)
        } else {
            setError("Login successful, but no token received.")
        }
    } catch (e) {
        setError(e.response?.data?.detail || 'Login failed.')
    }
    setLoading(false)
}

  const handleRegister = async () => {
    if (!email || !password || !fullName) { setError('Please fill required fields.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); setError('')
    try {
      await registerUser({ email, password, full_name:fullName, phone, village, district, preferred_lang:lang })
      setMode('check-email')
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f0fdf4', fontFamily:"'Nunito',sans-serif" }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>

      {/* Hero header */}
      <div style={{
        background:'linear-gradient(135deg,#065f46,#059669,#34d399)',
        padding:'44px 20px 36px', textAlign:'center',
        borderRadius:'0 0 32px 32px',
      }}>
        <div style={{ fontSize:56, marginBottom:10 }}>🌿</div>
        <div style={{ color:'#fff', fontSize:28, fontWeight:900, marginBottom:4 }}>Agri AI</div>
        <div style={{ color:'#a7f3d0', fontSize:14 }}>Smart Farming Assistant · Telangana</div>
      </div>

      <div style={{ padding:'24px 20px', maxWidth:420, margin:'0 auto' }}>

        {/* ── CHECK EMAIL SCREEN ── */}
        {mode === 'check-email' && (
          <div style={{
            background:'#fff', borderRadius:20, padding:28,
            boxShadow:'0 4px 20px rgba(0,0,0,0.08)', textAlign:'center',
          }}>
            <div style={{ fontSize:56, marginBottom:12 }}>📧</div>
            <div style={{ fontWeight:900, color:'#064e3b', fontSize:20, marginBottom:8 }}>
              Check Your Email
            </div>
            <div style={{ color:'#6b7280', fontSize:14, lineHeight:1.6, marginBottom:24 }}>
              A confirmation link has been sent to<br />
              <strong style={{ color:'#059669' }}>{email}</strong><br /><br />
              Click the link in the email to verify your account,
              then come back and log in.
            </div>
            <Btn onClick={() => setMode('login')}>
              🔑 Go to Login
            </Btn>
            <div style={{ marginTop:12, fontSize:12, color:'#9ca3af' }}>
              Check spam folder if you don't see it
            </div>
          </div>
        )}

        {/* Tab switcher */}
        {mode !== 'check-email' && (
          <>
            <div style={{
              display:'flex', background:'#e5e7eb',
              borderRadius:14, padding:4, marginBottom:24,
            }}>
              {[
                { id:'login',    label:'🔑 Login'    },
                { id:'register', label:'✍️ Register' },
              ].map(m => (
                <button key={m.id} onClick={() => { setMode(m.id); setError('') }} style={{
                  flex:1, padding:'11px 0', borderRadius:11,
                  background: mode===m.id ? '#fff' : 'transparent',
                  border:'none', fontWeight:800, fontSize:14,
                  color: mode===m.id ? '#059669' : '#6b7280',
                  cursor:'pointer', fontFamily:'inherit',
                  boxShadow: mode===m.id ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  transition:'all .2s',
                }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                background:'#fef2f2', border:'1px solid #fca5a5',
                borderRadius:10, padding:'10px 14px', marginBottom:16,
                color:'#dc2626', fontSize:13, fontWeight:600,
              }}>❌ {error}</div>
            )}
          </>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <div style={{
            background:'#fff', borderRadius:20, padding:22,
            boxShadow:'0 4px 20px rgba(0,0,0,0.07)',
          }}>
            <div style={{ fontWeight:900, color:'#064e3b', fontSize:19, marginBottom:20 }}>
              Welcome Back 👋
            </div>

            <Input label="Email" type="email" value={email}
              onChange={setEmail} placeholder="farmer@example.com" required />

            {/* Password with show/hide */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:700, color:'#374151', marginBottom:5 }}>
                Password <span style={{ color:'#dc2626' }}>*</span>
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width:'100%', padding:'11px 46px 11px 14px',
                    borderRadius:10, fontSize:15, border:'2px solid #e5e7eb',
                    outline:'none', boxSizing:'border-box',
                    background:'#f9fafb', fontFamily:'inherit',
                  }}
                />
                <button onClick={() => setShowPass(!showPass)} style={{
                  position:'absolute', right:12, top:'50%',
                  transform:'translateY(-50%)', background:'none',
                  border:'none', cursor:'pointer', fontSize:18,
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <Btn onClick={handleLogin} loading={loading}>🔑 Login to Agri</Btn>

            <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#6b7280' }}>
              No account?{' '}
              <span onClick={() => setMode('register')}
                style={{ color:'#059669', fontWeight:700, cursor:'pointer' }}>
                Register here →
              </span>
            </div>
          </div>
        )}

        {/* ── REGISTER FORM ── */}
        {mode === 'register' && (
          <div style={{
            background:'#fff', borderRadius:20, padding:22,
            boxShadow:'0 4px 20px rgba(0,0,0,0.07)',
          }}>
            <div style={{ fontWeight:900, color:'#064e3b', fontSize:19, marginBottom:20 }}>
              Create Account 🌱
            </div>

            <Input label="Full Name" value={fullName} onChange={setFullName}
              placeholder="Ramu Reddy" required />
            <Input label="Email" type="email" value={email}
              onChange={setEmail} placeholder="farmer@example.com" required />
            <Input label="Phone" type="tel" value={phone}
              onChange={setPhone} placeholder="9876543210" />
            <Input label="Village / Mandal" value={village}
              onChange={setVillage} placeholder="Jadcherla" />

            {/* District */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:700,
                color:'#374151', marginBottom:5 }}>District</label>
              <select value={district} onChange={e => setDistrict(e.target.value)} style={{
                width:'100%', padding:'11px 14px', borderRadius:10, fontSize:15,
                border:'2px solid #e5e7eb', background:'#f9fafb', fontFamily:'inherit',
              }}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Language */}
            <div style={{ marginBottom:14 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:700,
                color:'#374151', marginBottom:6 }}>Preferred Language</label>
              <div style={{ display:'flex', gap:8 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => setLang(l.code)} style={{
                    flex:1, padding:'10px 4px', borderRadius:10,
                    border:`2px solid ${lang===l.code ? '#059669' : '#e5e7eb'}`,
                    background: lang===l.code ? '#ecfdf5' : '#f9fafb',
                    color: lang===l.code ? '#059669' : '#374151',
                    fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
                  }}>{l.label}</button>
                ))}
              </div>
            </div>

            {/* Password + strength */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:'block', fontSize:13, fontWeight:700,
                color:'#374151', marginBottom:5 }}>
                Password <span style={{ color:'#dc2626' }}>*</span>
              </label>
              <div style={{ position:'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  style={{
                    width:'100%', padding:'11px 46px 11px 14px',
                    borderRadius:10, fontSize:15, border:'2px solid #e5e7eb',
                    outline:'none', boxSizing:'border-box',
                    background:'#f9fafb', fontFamily:'inherit',
                  }}
                />
                <button onClick={() => setShowPass(!showPass)} style={{
                  position:'absolute', right:12, top:'50%',
                  transform:'translateY(-50%)', background:'none',
                  border:'none', cursor:'pointer', fontSize:18,
                }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {/* Strength bar */}
              <div style={{ display:'flex', gap:4, marginTop:6 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    flex:1, height:4, borderRadius:2,
                    background: password.length >= i*3
                      ? (i===1?'#dc2626':i===2?'#f59e0b':'#059669')
                      : '#e5e7eb',
                    transition:'background .3s',
                  }} />
                ))}
              </div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>
                {!password ? '' : password.length<3 ? 'Weak' : password.length<6 ? 'Medium' : '✅ Strong'}
              </div>
            </div>

            <Btn onClick={handleRegister} loading={loading}>
              ✍️ Create Account
            </Btn>

            <div style={{ textAlign:'center', marginTop:16, fontSize:13, color:'#6b7280' }}>
              Already registered?{' '}
              <span onClick={() => setMode('login')}
                style={{ color:'#059669', fontWeight:700, cursor:'pointer' }}>
                Login →
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}