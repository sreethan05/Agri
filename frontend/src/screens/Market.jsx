import { useState, useEffect } from 'react'
import { getMarketPrices } from '../utils/api.js'

const CROPS = [
  'All','Tomato','Potato','Onion','Rice','Maize',
  'Cotton','Chilli','Turmeric','Soybean','Groundnut',
  'Wheat','Brinjal','Capsicum','Cabbage','Banana'
]

const CROP_EMOJI = {
  Tomato:'🍅', Potato:'🥔', Onion:'🧅', Rice:'🌾',
  Maize:'🌽', Cotton:'🌸', Chilli:'🌶', Turmeric:'🟡',
  Soybean:'🫘', Groundnut:'🥜', Wheat:'🌾', Brinjal:'🍆',
  Capsicum:'🫑', Cabbage:'🥬', Banana:'🍌',
}

export default function Market() {
  const [records,    setRecords]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [source,     setSource]     = useState('')   // 'live' | 'fallback' | 'cache'
  const [filter,     setFilter]     = useState('All')
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async (commodity = '') => {
    setLoading(true)
    setError('')
    try {
      const data = await getMarketPrices(
        commodity === 'All' ? '' : commodity,
        'Telangana'
      )
      // Handle both old format (array) and new format (object)
      const recs = Array.isArray(data)
        ? data
        : (data.records || [])
      setRecords(recs)
      setSource(Array.isArray(data) ? 'live' : (data.source || 'live'))
    } catch (e) {
      setError('Could not load market prices.')
      console.error('Market fetch error:', e)
    }
    setLoading(false)
  }

  const handleFilter = (crop) => {
    setFilter(crop)
    fetchPrices(crop === 'All' ? '' : crop)
  }

  // Apply search filter on top of API filter
  const displayed = records.filter(r => {
    if (!searchText) return true
    return r.commodity?.toLowerCase().includes(searchText.toLowerCase()) ||
           r.market?.toLowerCase().includes(searchText.toLowerCase())
  })

  const formatPrice = (p) => {
    const n = parseFloat(p)
    return isNaN(n) ? p : `₹${n.toLocaleString('en-IN')}`
  }

  const getEmoji = (commodity) =>
    CROP_EMOJI[commodity] || '🌿'

  return (
    <div style={{ padding:'16px 16px 32px' }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:'#064e3b', marginBottom:4 }}>
        📊 Market Prices
      </h2>

      {/* Source badge */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <span style={{ fontSize:13, color:'#6b7280' }}>Telangana APMC Mandis</span>
        {source && (
          <span style={{
            fontSize:11, fontWeight:700, padding:'2px 10px',
            borderRadius:20,
            background: source==='live'    ? '#ecfdf5' :
                        source==='cache'   ? '#eff6ff' : '#fffbeb',
            color:      source==='live'    ? '#059669' :
                        source==='cache'   ? '#1d4ed8' : '#f59e0b',
          }}>
            {source==='live'     ? '🟢 Live'       :
             source==='cache'    ? '🔵 Cached'     :
             source==='fallback' ? '🟡 Reference'  : ''}
          </span>
        )}
      </div>

      {/* Search box */}
      <input
        type="text"
        placeholder="🔍 Search crop or market..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        style={{
          width:'100%', padding:'10px 14px', borderRadius:12,
          border:'2px solid #e5e7eb', fontSize:14, marginBottom:14,
          outline:'none', boxSizing:'border-box',
          background:'#f9fafb', fontFamily:'inherit',
        }}
        onFocus={e => e.target.style.borderColor='#059669'}
        onBlur={e  => e.target.style.borderColor='#e5e7eb'}
      />

      {/* Crop filter chips */}
      <div style={{
        display:'flex', gap:8, overflowX:'auto',
        paddingBottom:8, marginBottom:16,
      }}>
        {CROPS.map(crop => (
          <button
            key={crop}
            onClick={() => handleFilter(crop)}
            style={{
              flex:'0 0 auto', padding:'7px 14px',
              borderRadius:20, border:'none', cursor:'pointer',
              fontFamily:'inherit', fontSize:13, fontWeight:700,
              background: filter===crop ? '#059669' : '#e5e7eb',
              color:      filter===crop ? '#fff'    : '#6b7280',
              transition:'all .2s',
            }}
          >
            {CROP_EMOJI[crop] || ''} {crop}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{
          textAlign:'center', padding:40,
          background:'#fff', borderRadius:16,
          boxShadow:'0 2px 8px rgba(0,0,0,.06)',
        }}>
          <div style={{
            fontSize:36, marginBottom:12,
            animation:'spin 1s linear infinite', display:'inline-block',
          }}>⟳</div>
          <div style={{ color:'#6b7280', fontSize:14 }}>
            Fetching mandi prices...
          </div>
          <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          background:'#fef2f2', border:'1px solid #fca5a5',
          borderRadius:12, padding:14, marginBottom:14,
          color:'#dc2626', fontSize:13,
        }}>
          ❌ {error}
          <button
            onClick={() => fetchPrices()}
            style={{
              display:'block', marginTop:10, padding:'8px 20px',
              borderRadius:20, background:'#dc2626', color:'#fff',
              border:'none', cursor:'pointer', fontFamily:'inherit',
              fontSize:13, fontWeight:700,
            }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* Fallback notice */}
      {source === 'fallback' && !loading && (
        <div style={{
          background:'#fffbeb', border:'1px solid #fde68a',
          borderRadius:10, padding:'10px 14px',
          fontSize:12, color:'#92400e', marginBottom:14,
          display:'flex', alignItems:'center', gap:8,
        }}>
          <span style={{ fontSize:18 }}>⚠️</span>
          <span>
            Government API is slow right now.
            Showing reference prices for Telangana mandis.
            Actual prices may vary.
          </span>
        </div>
      )}

      {/* Records */}
      {!loading && displayed.length === 0 && !error && (
        <div style={{
          textAlign:'center', padding:40,
          background:'#fff', borderRadius:16,
          boxShadow:'0 2px 8px rgba(0,0,0,.06)',
        }}>
          <div style={{ fontSize:40, marginBottom:10 }}>📭</div>
          <div style={{ color:'#374151', fontWeight:700 }}>No results found</div>
          <div style={{ color:'#9ca3af', fontSize:13, marginTop:4 }}>
            Try a different crop or clear the search
          </div>
        </div>
      )}

      {!loading && displayed.map((record, i) => {
        const min   = parseFloat(record.min_price)   || 0
        const max   = parseFloat(record.max_price)   || 0
        const modal = parseFloat(record.modal_price) || 0

        // Simple trend based on modal vs average of min/max
        const avg   = (min + max) / 2
        const trend = modal > avg * 1.02 ? 'up'
                    : modal < avg * 0.98 ? 'down'
                    : 'stable'

        return (
          <div key={i} style={{
            background:'#fff', borderRadius:16, padding:16,
            marginBottom:12, boxShadow:'0 2px 8px rgba(0,0,0,.06)',
          }}>
            {/* Header */}
            <div style={{
              display:'flex', justifyContent:'space-between',
              alignItems:'flex-start', marginBottom:12,
            }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:24 }}>{getEmoji(record.commodity)}</span>
                  <span style={{ fontSize:17, fontWeight:800, color:'#111827' }}>
                    {record.commodity}
                  </span>
                </div>
                <div style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>
                  📍 {record.market || 'Telangana'}
                  {record.variety && record.variety !== 'Other' &&
                    ` · ${record.variety}`}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:22, fontWeight:900, color:'#064e3b' }}>
                  {formatPrice(record.modal_price)}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:'#6b7280' }}>
                  per quintal
                </div>
                <div style={{
                  fontSize:12, fontWeight:700, marginTop:2,
                  color: trend==='up'   ? '#059669' :
                         trend==='down' ? '#dc2626' : '#6b7280',
                }}>
                  {trend==='up' ? '↑ Rising' : trend==='down' ? '↓ Falling' : '→ Stable'}
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div style={{ display:'flex', gap:8 }}>
              {[
                ['Min',   record.min_price,   '#dc2626', '#fef2f2'],
                ['Max',   record.max_price,   '#059669', '#ecfdf5'],
                ['Modal', record.modal_price, '#1d4ed8', '#eff6ff'],
              ].map(([label, value, color, bg]) => (
                <div key={label} style={{
                  flex:1, textAlign:'center', background: bg,
                  borderRadius:10, padding:'8px 4px',
                }}>
                  <div style={{ fontSize:10, color:'#9ca3af', fontWeight:600 }}>
                    {label}
                  </div>
                  <div style={{ fontSize:13, fontWeight:800, color }}>
                    {formatPrice(value)}
                  </div>
                </div>
              ))}
            </div>

            {/* Arrival date if available */}
            {record.arrival_date && (
              <div style={{
                marginTop:8, fontSize:11, color:'#9ca3af', textAlign:'right',
              }}>
                📅 {record.arrival_date}
              </div>
            )}
          </div>
        )
      })}

      {/* Refresh */}
      {!loading && displayed.length > 0 && (
        <button
          onClick={() => fetchPrices(filter === 'All' ? '' : filter)}
          style={{
            width:'100%', padding:'12px 0', borderRadius:50,
            background:'transparent', border:'2px solid #059669',
            color:'#059669', fontSize:14, fontWeight:700,
            cursor:'pointer', fontFamily:'inherit', marginTop:8,
          }}
        >
          🔄 Refresh Prices
        </button>
      )}

      <div style={{
        marginTop:12, textAlign:'center', fontSize:11, color:'#9ca3af',
      }}>
        Source: data.gov.in · Prices in ₹ per quintal
      </div>
    </div>
  )
}