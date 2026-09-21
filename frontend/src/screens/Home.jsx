export default function Home({ setTab }) {
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const actions = [
    { icon:'🔬', label:'Detect Disease',  tab:'detect',     color:'#059669', bg:'#ecfdf5' },
    { icon:'🌤',  label:'Weather Advice',  tab:'weather',    color:'#3b82f6', bg:'#eff6ff' },
    { icon:'📊', label:'Market Prices',   tab:'market',     color:'#f59e0b', bg:'#fffbeb' },
    { icon:'🧮', label:'Profit Calc',     tab:'calculator', color:'#7c3aed', bg:'#f5f3ff' },
  ]

  const tips = [
    'Upload leaf photos in good natural lighting for best accuracy.',
    'Take close-up photos showing the infected area clearly.',
    'Spray fungicide in the early morning or evening — never midday.',
    'Check lower leaf surfaces — most pests hide underneath.',
    'Rotate crops every 2 years to prevent soil-borne diseases.',
  ]
  const tip = tips[new Date().getDate() % tips.length]

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #065f46 0%, #059669 60%, #34d399 100%)',
        padding: '28px 20px 24px',
        borderRadius: '0 0 28px 28px',
        marginBottom: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute', bottom:-30, right:30,  width:70,  height:70,  borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />

        <div style={{ color:'rgba(255,255,255,0.7)', fontSize:12, marginBottom:4, fontWeight:600 }}>
          {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
        </div>
        <div style={{ color:'#fff', fontSize:22, fontWeight:900, marginBottom:16, lineHeight:1.3 }}>
          {greeting}, Farmer! 🌾
        </div>

        {/* Tip card */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: 14, padding: '12px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize:26, flexShrink:0 }}>💡</span>
          <div>
            <div style={{ color:'#fff', fontSize:13, fontWeight:700, marginBottom:2 }}>Today's Tip</div>
            <div style={{ color:'rgba(255,255,255,0.85)', fontSize:13, lineHeight:1.4 }}>{tip}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Quick Actions */}
        <div style={{ fontSize:15, fontWeight:800, color:'#064e3b', marginBottom:14 }}>⚡ Quick Actions</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
          {actions.map(a => (
            <div
              key={a.tab}
              onClick={() => setTab(a.tab)}
              style={{
                background:'#fff', borderRadius:16, padding:'20px 16px',
                textAlign:'center', cursor:'pointer',
                boxShadow:'0 2px 10px rgba(0,0,0,0.06)',
                border:'2px solid transparent',
                transition:'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.borderColor = a.color
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <div style={{ fontSize:38, marginBottom:10 }}>{a.icon}</div>
              <div style={{ fontWeight:700, color:'#111827', fontSize:14 }}>{a.label}</div>
              <div style={{ width:36, height:4, borderRadius:2, background:a.color, margin:'8px auto 0', opacity:0.6 }} />
            </div>
          ))}
        </div>

        {/* Crops supported */}
        <div style={{
          background:'#fff', borderRadius:16, padding:16,
          boxShadow:'0 2px 8px rgba(0,0,0,0.06)', marginBottom:16,
        }}>
          <div style={{ fontWeight:800, color:'#064e3b', marginBottom:14, fontSize:15 }}>🌱 Supported Crops</div>
          <div style={{ display:'flex', gap:10 }}>
            {[
              { e:'🍅', name:'Tomato',  diseases:'10 diseases', color:'#dc2626' },
              { e:'🥔', name:'Potato',  diseases:'3 diseases',  color:'#92400e' },
              { e:'🫑', name:'Pepper',  diseases:'2 diseases',  color:'#16a34a' },
            ].map(c => (
              <div key={c.name} style={{
                flex:1, textAlign:'center', background:'#f9fafb',
                borderRadius:12, padding:'12px 4px',
                border:`2px solid ${c.color}22`,
              }}>
                <div style={{ fontSize:28, marginBottom:4 }}>{c.e}</div>
                <div style={{ fontWeight:700, fontSize:13, color:'#374151' }}>{c.name}</div>
                <div style={{ fontSize:11, color:'#9ca3af', marginTop:2 }}>{c.diseases}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How to use */}
        <div style={{
          background:'linear-gradient(135deg,#fffbeb,#fef9f0)',
          borderRadius:16, padding:16,
          border:'1px solid #fde68a',
        }}>
          <div style={{ fontWeight:800, color:'#92400e', marginBottom:12, fontSize:15 }}>📱 How to Use</div>
          {[
            ['1', '📷 Take a clear photo of the infected leaf'],
            ['2', '🔬 Tap Detect → Upload → Analyze Now'],
            ['3', '💊 Read treatment and prevention advice'],
            ['4', '🔊 Play Telugu audio for voice guidance'],
          ].map(([n, text]) => (
            <div key={n} style={{ display:'flex', gap:10, marginBottom:10, alignItems:'center' }}>
              <div style={{
                width:24, height:24, borderRadius:'50%',
                background:'#f59e0b', color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:12, fontWeight:900, flexShrink:0,
              }}>{n}</div>
              <span style={{ fontSize:13, color:'#374151' }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}