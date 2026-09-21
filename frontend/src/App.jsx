import { useState, useEffect } from 'react'
import Auth from './screens/Auth.jsx' // ✅ CORRECT

import Home       from './screens/Home.jsx'
import Detect     from './screens/Detect.jsx'
import Weather    from './screens/Weather.jsx'
import Market     from './screens/Market.jsx'
import Calculator from './screens/Calculator.jsx'
import History    from './screens/History.jsx'
import { getUser, getToken, logout, checkHealth } from './utils/api.js'

const TABS = [
  { id:'home',       icon:'🏠', label:'Home'    },
  { id:'detect',     icon:'🔬', label:'Detect'  },
  { id:'weather',    icon:'🌤',  label:'Weather' },
  { id:'market',     icon:'📊', label:'Market'  },
  { id:'calculator', icon:'🧮', label:'Profit'  },
  { id:'history',    icon:'📋', label:'History' },
]

const SCREENS = {
  home: Home, detect: Detect, weather: Weather,
  market: Market, calculator: Calculator, history: History,
}

export default function App() {
  // 1. Define State first
  const [user, setUser] = useState(() => {
    const u = getUser()
    const t = getToken()
    return (u && t) ? u : null
  })
  const [tab, setTab] = useState('home')
  const [online, setOnline] = useState(true)

  // 2. Log after definition
  console.log("Current User State:", user);
  console.log("LocalStorage User:", localStorage.getItem('agri_user'));

  useEffect(() => {
  const verifyBackend = async () => {
    try {
      await checkHealth();
      setOnline(true);
    } catch {
      // If it fails, wait 3 seconds and try one more time
      setTimeout(async () => {
        try {
          await checkHealth();
          setOnline(true);
        } catch {
          setOnline(false);
        }
      }, 3000);
    }
  };
  verifyBackend();
}, []);


  const handleAuthSuccess = (userData) => {
    console.log('Auth success, user:', userData)
    setUser(userData)
    setTab('home')
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    setTab('home')
  }

  if (!user || !user.id) {
    return <Auth onAuthSuccess={handleAuthSuccess} />
  }

  const Screen = SCREENS[tab] || Home

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: '#f0fdf4', fontFamily: "'Nunito', sans-serif",
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 0 40px rgba(0,0,0,0.12)',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46, #059669)',
        padding: '12px 16px',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 12px rgba(6,78,59,0.25)',
      }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:'50%',
              background:'rgba(255,255,255,0.2)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:18,
            }}>🌿</div>
            <div>
              <div style={{ color:'#fff', fontSize:17, fontWeight:900, lineHeight:1 }}>
                Agri AI
              </div>
              <div style={{ color:'#a7f3d0', fontSize:11 }}>
                👋 {user?.full_name?.split(' ')[0] || 'Farmer'}
              </div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:8, height:8, borderRadius:'50%',
              background: online ? '#4ade80' : '#f87171',
              boxShadow: online ? '0 0 6px #4ade80' : '0 0 6px #f87171',
            }} />
            <button
              onClick={handleLogout}
              style={{
                background:'rgba(255,255,255,0.15)', border:'none',
                borderRadius:20, padding:'5px 12px', color:'#fff',
                fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', paddingBottom:80 }}>
        {!online && (
          <div style={{
            background:'#fef2f2', borderBottom:'1px solid #fca5a5',
            padding:'10px 16px', fontSize:13, color:'#dc2626', fontWeight:600,
          }}>
            ⚠️ Backend offline — run: <code>python main.py</code>
          </div>
        )}
        <Screen setTab={setTab} user={user} />
      </div>

      <nav style={{
        position:'fixed', bottom:0,
        left:'50%', transform:'translateX(-50%)',
        width:'100%', maxWidth:430,
        background:'#fff', borderTop:'1px solid #e5e7eb',
        boxShadow:'0 -4px 20px rgba(0,0,0,0.08)',
        display:'flex', zIndex:100,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex:1, padding:'8px 0 10px',
              border:'none', background:'transparent', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            }}
          >
            <span style={{ fontSize:20, lineHeight:1 }}>{t.icon}</span>
            <span style={{
              fontSize:9, fontFamily:"'Nunito',sans-serif",
              fontWeight: tab===t.id ? 800 : 600,
              color: tab===t.id ? '#059669' : '#9ca3af',
            }}>
              {t.label}
            </span>
            {tab===t.id && (
              <div style={{
                width:18, height:3, borderRadius:2, background:'#059669',
              }} />
            )}
          </button>
        ))}
      </nav>
    </div>
  )
}
