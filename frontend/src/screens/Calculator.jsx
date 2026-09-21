import { useState } from 'react'

export default function Calculator() {
  const [form, setForm] = useState({
    crop:'Tomato', acres:'1', yield_:'2500',
    price:'25', cost:'55000', loss:'0',
  })
  const s  = k => v => setForm(p => ({...p, [k]:v}))
  const fv = k => parseFloat(form[k]) || 0

  const effYield  = fv('yield_') * fv('acres') * (1 - fv('loss') / 100)
  const revenue   = effYield * fv('price')
  const totalCost = fv('cost') * fv('acres')
  const profit    = revenue - totalCost
  const roi       = totalCost > 0 ? (profit / totalCost * 100) : 0
  const bep       = fv('yield_') > 0 ? fv('cost') / fv('yield_') : 0

  const inp = (label, key) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:13, fontWeight:600, color:'#374151', marginBottom:5 }}>
        {label}
      </label>
      <input
        type="number" value={form[key]}
        onChange={e => s(key)(e.target.value)}
        style={{
          width:'100%', padding:'10px 14px', borderRadius:10, fontSize:15,
          border:'2px solid #e5e7eb', outline:'none', boxSizing:'border-box',
          background:'#f9fafb', fontFamily:'inherit',
        }}
        onFocus={e => e.target.style.borderColor='#059669'}
        onBlur={e  => e.target.style.borderColor='#e5e7eb'}
      />
    </div>
  )

  return (
    <div style={{ padding:'16px 16px 32px' }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:'#064e3b', marginBottom:4 }}>🧮 Profit Calculator</h2>
      <p  style={{ fontSize:13, color:'#6b7280', marginBottom:18 }}>
        Calculate ROI and break-even for your crop
      </p>

      {/* Input card */}
      <div style={{
        background:'#fff', borderRadius:16, padding:18,
        boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:14,
      }}>
        <div style={{ fontWeight:800, color:'#064e3b', marginBottom:16, fontSize:15 }}>📋 Crop Details</div>

        <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:5 }}>Crop</label>
        <select
          value={form.crop} onChange={e => s('crop')(e.target.value)}
          style={{
            width:'100%', padding:'10px 14px', borderRadius:10, fontSize:15,
            border:'2px solid #e5e7eb', background:'#f9fafb',
            marginBottom:14, fontFamily:'inherit',
          }}
        >
          {['Tomato','Potato','Pepper','Rice','Cotton','Wheat','Onion','Maize'].map(c =>
            <option key={c}>{c}</option>
          )}
        </select>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 12px' }}>
          {inp('Land (acres)',     'acres')}
          {inp('Yield (kg/acre)', 'yield_')}
          {inp('Price (₹/kg)',    'price')}
          {inp('Cost (₹/acre)',   'cost')}
        </div>

        <label style={{ fontSize:13, fontWeight:600, color:'#374151', display:'block', marginBottom:6 }}>
          Disease Loss — <span style={{ color:'#dc2626' }}>{form.loss}%</span>
        </label>
        <input
          type="range" min="0" max="70" step="5" value={form.loss}
          onChange={e => s('loss')(e.target.value)}
          style={{ width:'100%', accentColor:'#059669', marginBottom:4 }}
        />
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9ca3af', marginBottom:4 }}>
          <span>0% — Healthy</span><span>70% — Severe Loss</span>
        </div>
      </div>

      {/* Result card */}
      <div style={{
        background: profit >= 0
          ? 'linear-gradient(135deg,#065f46,#059669)'
          : 'linear-gradient(135deg,#7f1d1d,#dc2626)',
        borderRadius:18, padding:22, textAlign:'center',
        color:'#fff', marginBottom:14,
      }}>
        <div style={{ fontSize:13, opacity:0.8, marginBottom:4 }}>
          Net {profit >= 0 ? 'Profit' : 'Loss'} · {form.acres} acres · {form.crop}
        </div>
        <div style={{ fontSize:42, fontWeight:900, marginBottom:14 }}>
          ₹{Math.abs(profit).toLocaleString('en-IN', { maximumFractionDigits:0 })}
        </div>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          {[
            ['ROI',     `${roi.toFixed(1)}%`],
            ['Revenue', `₹${revenue.toLocaleString('en-IN',{maximumFractionDigits:0})}`],
            ['Yield',   `${effYield.toFixed(0)} kg`],
          ].map(([l,v]) => (
            <div key={l} style={{
              background:'rgba(255,255,255,0.15)',
              borderRadius:12, padding:'8px 14px',
            }}>
              <div style={{ fontSize:11, opacity:0.8 }}>{l}</div>
              <div style={{ fontWeight:800, fontSize:15 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Break-even + advice */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
        <div style={{
          background:'#fffbeb', borderRadius:14, padding:14,
          textAlign:'center', border:'1px solid #fde68a',
        }}>
          <div style={{ fontSize:11, color:'#92400e', fontWeight:700, marginBottom:6 }}>Break-even Price</div>
          <div style={{ fontSize:20, fontWeight:900, color:'#f59e0b' }}>₹{bep.toFixed(0)}/kg</div>
          <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>
            {fv('price') > bep ? `₹${(fv('price')-bep).toFixed(0)} above BEP ✅` : '⚠️ Below BEP'}
          </div>
        </div>
        <div style={{
          background:'#ecfdf5', borderRadius:14, padding:14,
          textAlign:'center', border:'1px solid #bbf7d0',
        }}>
          <div style={{ fontSize:11, color:'#064e3b', fontWeight:700, marginBottom:6 }}>Total Investment</div>
          <div style={{ fontSize:20, fontWeight:900, color:'#059669' }}>
            ₹{totalCost.toLocaleString('en-IN',{maximumFractionDigits:0})}
          </div>
          <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{form.acres} acre(s)</div>
        </div>
      </div>

      {fv('loss') > 0 && (
        <div style={{
          background:'#ecfdf5', border:'1px solid #059669',
          borderRadius:12, padding:'12px 14px', fontSize:13, color:'#064e3b', fontWeight:600,
        }}>
          💡 Treating the disease now could save approx.{' '}
          ₹{(fv('yield_') * fv('acres') * (fv('loss')/100) * fv('price')).toLocaleString('en-IN',{maximumFractionDigits:0})}
        </div>
      )}
    </div>
  )
}