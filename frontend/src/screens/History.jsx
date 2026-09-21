import { useState, useEffect } from 'react'
import { getHistory, deleteHistory } from '../utils/api.js'

export default function History({ user }) {
  const [predictions, setPredictions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const data = await getHistory()
      setPredictions(data.predictions || [])
    } catch (e) {
      setError('Could not load history.')
    }
    setLoading(false)
  }

  const handleDelete = async (id) => {
    try {
      await deleteHistory(id)
      setPredictions(prev => prev.filter(p => p.id !== id))
    } catch (e) {
      setError('Delete failed.')
    }
  }

  const SEV_COLOR = {
    critical:'#dc2626', medium:'#f59e0b', none:'#059669', unknown:'#6b7280'
  }

  return (
    <div style={{ padding:'16px 16px 32px' }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:'#064e3b', marginBottom:4 }}>📋 Prediction History</h2>
      <p  style={{ fontSize:13, color:'#6b7280', marginBottom:18 }}>
        {user?.full_name}'s field diagnosis log
      </p>

      {loading && (
        <div style={{ textAlign:'center', padding:40, color:'#9ca3af' }}>
          ⟳ Loading history...
        </div>
      )}

      {error && (
        <div style={{
          background:'#fef2f2', borderRadius:12, padding:14,
          color:'#dc2626', fontSize:13, marginBottom:14,
        }}>❌ {error}</div>
      )}

      {!loading && predictions.length === 0 && (
        <div style={{
          textAlign:'center', padding:48,
          background:'#fff', borderRadius:16,
          boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize:52, marginBottom:12 }}>🔬</div>
          <div style={{ fontWeight:700, color:'#374151', marginBottom:8 }}>No predictions yet</div>
          <div style={{ color:'#9ca3af', fontSize:13 }}>
            Upload a leaf photo to get your first diagnosis
          </div>
        </div>
      )}

      {predictions.map(p => (
        <div key={p.id} style={{
          background:'#fff', borderRadius:16, padding:16,
          boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:12,
          borderLeft:`4px solid ${SEV_COLOR[p.severity] || '#6b7280'}`,
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, color:'#111827', fontSize:16 }}>{p.display_name}</div>
              <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>
                {p.crop_type} · {new Date(p.created_at).toLocaleDateString('en-IN', {
                  day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
                })}
              </div>
              <div style={{ display:'flex', gap:8, marginTop:8, flexWrap:'wrap' }}>
                <span style={{
                  background: SEV_COLOR[p.severity] + '20',
                  color: SEV_COLOR[p.severity],
                  borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700,
                }}>
                  {p.severity?.toUpperCase()}
                </span>
                <span style={{
                  background:'#ecfdf5', color:'#059669',
                  borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700,
                }}>
                  {p.confidence?.toFixed(1)}% confident
                </span>
                {p.location_village && (
                  <span style={{
                    background:'#eff6ff', color:'#1d4ed8',
                    borderRadius:20, padding:'2px 10px', fontSize:11, fontWeight:700,
                  }}>
                    📍 {p.location_village}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              style={{
                background:'#fef2f2', border:'none', borderRadius:8,
                padding:'6px 10px', color:'#dc2626', fontSize:16,
                cursor:'pointer', marginLeft:8, flexShrink:0,
              }}
            >🗑️</button>
          </div>

          {p.pesticide && (
            <div style={{
              marginTop:10, padding:'8px 12px',
              background:'#fffbeb', borderRadius:8, fontSize:12, color:'#92400e',
            }}>
              💊 {p.pesticide.slice(0, 80)}{p.pesticide.length > 80 ? '...' : ''}
            </div>
          )}
        </div>
      ))}

      {predictions.length > 0 && (
        <div style={{
          marginTop:8, padding:'10px 14px', background:'#ecfdf5',
          borderRadius:12, fontSize:12, color:'#064e3b', fontWeight:600,
          textAlign:'center',
        }}>
          📊 Total diagnoses: {predictions.length} · 
          Critical: {predictions.filter(p=>p.severity==='critical').length} · 
          Healthy: {predictions.filter(p=>p.severity==='none').length}
        </div>
      )}
    </div>
  )
}