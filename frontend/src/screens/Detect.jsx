import { useState, useRef } from 'react'
import { predictDisease, speakText } from '../utils/api.js'

const SEV = {
  critical: { bg:'#fef2f2', border:'#dc2626', badge:'#dc2626', label:'CRITICAL' },
  medium:   { bg:'#fffbeb', border:'#f59e0b', badge:'#f59e0b', label:'MEDIUM'   },
  none:     { bg:'#ecfdf5', border:'#059669', badge:'#059669', label:'HEALTHY'  },
  unknown:  { bg:'#f9fafb', border:'#6b7280', badge:'#6b7280', label:'UNKNOWN'  },
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background:'#fff', borderRadius:16, padding:16,
      boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
      marginBottom:12, ...style,
    }}>
      {children}
    </div>
  )
}

function InfoBox({ title, text, color, border }) {
  return (
    <div style={{
      background:color, borderLeft:`4px solid ${border}`,
      borderRadius:12, padding:'12px 14px', marginBottom:10,
    }}>
      <div style={{ fontWeight:700, fontSize:13, color:'#374151', marginBottom:4 }}>{title}</div>
      <div style={{ fontSize:13, color:'#374151', lineHeight:1.6, whiteSpace:'pre-line' }}>{text}</div>
    </div>
  )
}

export default function Detect() {
  const [image,   setImage]   = useState(null)
  const [preview, setPreview] = useState(null)
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [activeTab, setActiveTab] = useState('treatment')
  const [playing, setPlaying] = useState(false)
  const fileRef  = useRef()
  const audioRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    setImage(file)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }

  const analyze = async () => {
    if (!image) return
    setLoading(true)
    setError(null)
    try {
      const data = await predictDisease(image)
      setResult(data)
      setActiveTab('treatment')
    } catch (e) {
      setError(
        e.code === 'ECONNABORTED'
          ? 'Request timed out. Model may still be loading — try again.'
          : e.response?.data?.detail || 'Cannot connect to backend. Is python main.py running?'
      )
    } finally {
      setLoading(false)
    }
  }

  const playTelugu = () => {
    if (!result || playing) return
    const text = `${result.display_name} వ్యాధి వచ్చింది. నమ్మకం ${Math.round(result.confidence)} శాతం. ${result.telugu}`
    const url  = speakText(text, 'te')
    if (audioRef.current) {
      audioRef.current.src = url
      setPlaying(true)
      audioRef.current.play()
      audioRef.current.onended = () => setPlaying(false)
      audioRef.current.onerror = () => { setPlaying(false); setError('Audio failed — needs internet.') }
    }
  }

  const reset = () => {
    setResult(null); setImage(null)
    setPreview(null); setError(null)
    setPlaying(false)
  }

  const sev   = result ? (SEV[result.severity] || SEV.unknown) : null

  return (
    <div style={{ padding:'16px 16px 32px' }}>
      <audio ref={audioRef} />

      <h2 style={{ fontSize:22, fontWeight:900, color:'#064e3b', marginBottom:4 }}>🔬 Disease Detection</h2>
      <p  style={{ fontSize:13, color:'#6b7280', marginBottom:18 }}>
        Upload a clear leaf photo for instant AI diagnosis
      </p>

      {/* ── Upload zone ── */}
      {!result && (
        <>
          <div
            onClick={() => fileRef.current.click()}
            style={{
              border:`2.5px dashed ${preview ? '#059669' : '#bbf7d0'}`,
              borderRadius:18, padding:28, textAlign:'center',
              background: preview ? '#ecfdf5' : '#f8fffe',
              cursor:'pointer', marginBottom:14, minHeight:200,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              transition:'all 0.2s',
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          >
            {preview ? (
              <>
                <img
                  src={preview} alt="leaf"
                  style={{ maxHeight:200, maxWidth:'100%', borderRadius:14, marginBottom:10, objectFit:'cover' }}
                />
                <span style={{ color:'#059669', fontWeight:700, fontSize:13 }}>✓ Image ready — tap Analyze</span>
              </>
            ) : (
              <>
                <div style={{ fontSize:56, marginBottom:12 }}>📷</div>
                <div style={{ fontWeight:700, color:'#374151', fontSize:16, marginBottom:4 }}>
                  Tap to upload leaf photo
                </div>
                <div style={{ color:'#9ca3af', fontSize:13 }}>or take photo with camera</div>
                <div style={{ color:'#d1fae5', fontSize:12, marginTop:8 }}>JPG / PNG — max 15 MB</div>
              </>
            )}
          </div>

          <input
            ref={fileRef} type="file" accept="image/*" capture="environment"
            style={{ display:'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />

          {preview && (
            <button
              onClick={analyze} disabled={loading}
              style={{
                width:'100%', padding:'14px 0', borderRadius:50,
                background: loading ? '#9ca3af' : 'linear-gradient(135deg,#059669,#16a34a)',
                color:'#fff', border:'none', fontSize:16, fontWeight:800,
                cursor: loading ? 'not-allowed' : 'pointer', marginBottom:10,
                boxShadow: loading ? 'none' : '0 4px 16px rgba(5,150,105,0.35)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:8,
              }}
            >
              {loading
                ? <><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span> Analyzing…</>
                : '🔬 Analyze Now'}
            </button>
          )}
        </>
      )}

      {/* ── Error ── */}
      {error && (
        <div style={{
          background:'#fef2f2', border:'1px solid #fca5a5',
          borderRadius:12, padding:14, marginBottom:14,
          color:'#dc2626', fontSize:13, lineHeight:1.5,
        }}>
          ❌ {error}
        </div>
      )}

      {/* ── Result ── */}
      {result && sev && (
        <>
          {/* Disease header */}
          <div style={{
            background: sev.bg, border:`2px solid ${sev.border}`,
            borderRadius:18, padding:18, marginBottom:12,
          }}>
            {/* Image thumbnail + name */}
            <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginBottom:14 }}>
              <img src={preview} alt=""
                style={{ width:72, height:72, borderRadius:12, objectFit:'cover', flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:20, fontWeight:900, color:'#111827', lineHeight:1.2, marginBottom:8 }}>
                  {result.emoji} {result.display_name}
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <span style={{
                    background:sev.badge, color:'#fff',
                    borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700,
                  }}>
                    {sev.label}
                  </span>
                  <span style={{
                    background: result.confidence >= 85 ? '#059669' : result.confidence >= 65 ? '#f59e0b' : '#dc2626',
                    color:'#fff', borderRadius:20, padding:'3px 12px', fontSize:12, fontWeight:700,
                  }}>
                    {result.confidence.toFixed(1)}% confident
                  </span>
                </div>
              </div>
            </div>

            {/* Top 3 confidence bars */}
            <div>
              {result.top5?.slice(0, 3).map((p, i) => (
                <div key={i} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                    <span style={{ color: i===0?'#064e3b':'#9ca3af', fontWeight: i===0?700:500 }}>
                      {i===0?'🥇':i===1?'🥈':'🥉'} {p.label}
                    </span>
                    <span style={{ fontWeight:700, color: i===0?'#059669':'#9ca3af' }}>{p.confidence}%</span>
                  </div>
                  <div style={{ height:7, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', borderRadius:4,
                      width:`${p.confidence}%`,
                      background: i===0 ? sev.border : '#e5e7eb',
                      transition:'width 0.8s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            {[
              { id:'treatment',  label:'💊 Treat'   },
              { id:'prevention', label:'🛡️ Prevent' },
              { id:'audio',      label:'🔊 Audio'   },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  flex:1, padding:'10px 4px', borderRadius:12, border:'none',
                  background: activeTab===t.id ? '#059669' : '#e5e7eb',
                  color:      activeTab===t.id ? '#fff'    : '#6b7280',
                  fontWeight:700, fontSize:13, cursor:'pointer',
                  fontFamily:"'Nunito',sans-serif",
                  transition:'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Treatment tab */}
          {activeTab === 'treatment' && (
            <div>
              {result.severity === 'critical' && (
                <div style={{
                  background:'#fef2f2', border:'2px solid #dc2626',
                  borderRadius:12, padding:'12px 14px', marginBottom:12,
                  display:'flex', alignItems:'center', gap:10,
                }}>
                  <span style={{ fontSize:24 }}>🚨</span>
                  <div style={{ color:'#dc2626', fontWeight:800, fontSize:14 }}>
                    IMMEDIATE ACTION REQUIRED — Act within 24 hours
                  </div>
                </div>
              )}
              <InfoBox title="🧪 Pesticide / Fungicide"  text={result.pesticide}  color="#fffbeb" border="#f59e0b" />
              <InfoBox title="🌱 Fertilizer Advice"       text={result.fertilizer} color="#ecfdf5" border="#059669" />
              <InfoBox
                title="⚡ Immediate Action"
                text={result.action}
                color={result.severity==='critical' ? '#fef2f2' : '#eff6ff'}
                border={result.severity==='critical' ? '#dc2626'  : '#3b82f6'}
              />
            </div>
          )}

          {/* Prevention tab */}
          {activeTab === 'prevention' && (
            <Card>
              <div style={{ fontWeight:800, color:'#064e3b', fontSize:15, marginBottom:14 }}>
                🛡️ Prevention Tips
              </div>
              {result.tips?.map((tip, i) => (
                <div key={i} style={{ display:'flex', gap:10, marginBottom:12, alignItems:'flex-start' }}>
                  <div style={{
                    width:26, height:26, borderRadius:'50%',
                    background:'#ecfdf5', border:'2px solid #059669',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:12, fontWeight:900, color:'#059669', flexShrink:0,
                  }}>{i + 1}</div>
                  <span style={{ fontSize:13, color:'#374151', lineHeight:1.5 }}>{tip}</span>
                </div>
              ))}
            </Card>
          )}

          {/* Audio tab */}
          {activeTab === 'audio' && (
            <Card style={{ textAlign:'center', padding:24 }}>
              <div style={{ fontSize:52, marginBottom:12 }}>🔊</div>
              <div style={{ fontWeight:800, color:'#374151', fontSize:16, marginBottom:6 }}>
                Telugu Voice Advisory
              </div>
              <div style={{ fontSize:13, color:'#9ca3af', marginBottom:20, lineHeight:1.5 }}>
                Hear the diagnosis and treatment advice spoken in Telugu
              </div>
              <button
                onClick={playTelugu}
                disabled={playing}
                style={{
                  background: playing ? '#9ca3af' : 'linear-gradient(135deg,#059669,#16a34a)',
                  color:'#fff', border:'none', borderRadius:50,
                  padding:'14px 32px', fontSize:16, fontWeight:800,
                  cursor: playing ? 'wait' : 'pointer', width:'100%',
                  boxShadow: playing ? 'none' : '0 4px 16px rgba(5,150,105,0.35)',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  fontFamily:"'Nunito',sans-serif",
                }}
              >
                {playing
                  ? <><span style={{ animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</span> Playing…</>
                  : '▶️ Play Telugu Audio'}
              </button>
              <div style={{ marginTop:14, fontSize:12, color:'#9ca3af' }}>
                Requires internet · gTTS powered
              </div>

              {/* Telugu text preview */}
              <div style={{
                marginTop:16, padding:14,
                background:'#f9fafb', borderRadius:12,
                fontSize:13, color:'#374151', lineHeight:1.6, textAlign:'left',
              }}>
                <div style={{ fontWeight:700, color:'#059669', marginBottom:6 }}>Telugu text:</div>
                {result.telugu}
              </div>
            </Card>
          )}

          {/* Scan again */}
          <button
            onClick={reset}
            style={{
              width:'100%', padding:'13px 0', borderRadius:50,
              background:'transparent', border:'2px solid #059669',
              color:'#059669', fontSize:14, fontWeight:700,
              cursor:'pointer', marginTop:6,
              fontFamily:"'Nunito',sans-serif",
            }}
          >
            🔄 Scan Another Leaf
          </button>
        </>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}