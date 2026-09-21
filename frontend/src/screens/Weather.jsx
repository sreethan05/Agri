// src/screens/Weather.jsx
import { useState, useEffect } from 'react'
import { getLiveWeather } from '../utils/api.js'

// Farming advice rules engine
function getFarmingAdvice(weather) {
  const advice = []
  const humidity    = weather.main?.humidity    || 0
  const temp        = weather.main?.temp        || 25
  const windSpeed   = weather.wind?.speed       || 0
  const description = weather.weather?.[0]?.main?.toLowerCase() || ''

  if (description.includes('rain') || description.includes('drizzle')) {
    advice.push('🌧 Rain detected — delay fertilizer and pesticide application.')
    advice.push('💧 Check field drainage to prevent waterlogging.')
  }
  if (description.includes('thunderstorm')) {
    advice.push('⛈ Thunderstorm — avoid all field operations today.')
  }
  if (humidity > 80) {
    advice.push('💦 High humidity — increased risk of fungal diseases. Inspect crops.')
    advice.push('🍄 Consider preventive fungicide spray tomorrow if dry.')
  } else if (humidity < 30) {
    advice.push('🌵 Low humidity — increase irrigation frequency.')
  }
  if (temp > 38) {
    advice.push('🌡 Extreme heat — irrigate in early morning or after sunset only.')
  } else if (temp < 15) {
    advice.push('❄ Cool weather — good conditions for Rabi crop sowing.')
  }
  if (windSpeed > 10) {
    advice.push('💨 High winds — avoid spraying pesticides today.')
  }
  if (description.includes('clear') || description.includes('sun')) {
    advice.push('☀️ Clear sky — good day for harvesting and field operations.')
  }
  if (description.includes('cloud')) {
    advice.push('⛅ Cloudy — suitable for transplanting seedlings.')
  }
  if (advice.length === 0) {
    advice.push('✅ Normal conditions — good day for regular farm activities.')
  }
  return advice
}

// Map OpenWeather icon code to emoji
function getWeatherEmoji(iconCode) {
  if (!iconCode) return '🌡'
  const code = iconCode.replace('n','d') // treat night same as day
  const map = {
    '01d':'☀️', '02d':'⛅', '03d':'☁️', '04d':'☁️',
    '09d':'🌧', '10d':'🌦', '11d':'⛈', '13d':'❄️', '50d':'🌫'
  }
  return map[code] || '🌡'
}

function StatCard({ icon, label, value, unit, bg='#f9fafb', color='#374151' }) {
  return (
    <div style={{
      background: bg, borderRadius:14, padding:'14px 10px',
      textAlign:'center', flex:1,
    }}>
      <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
      <div style={{ fontSize:18, fontWeight:900, color }}>{value}</div>
      <div style={{ fontSize:10, color:'#9ca3af', fontWeight:600 }}>
        {unit && <span style={{ fontSize:12 }}>{unit} </span>}
        {label}
      </div>
    </div>
  )
}

export default function Weather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchWeather()
  }, [])

  const fetchWeather = async () => {
    setLoading(true)
    setError('')
    try {
      // Get device location, fallback to Hyderabad
      const position = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'))
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 8000, maximumAge: 300000
        })
      }).catch(() => ({
        coords: { latitude: 17.4843, longitude: 78.3889 }  // Hyderabad default
      }))

      const data = await getLiveWeather(
        position.coords.latitude,
        position.coords.longitude
      )
      setWeather(data)
    } catch (e) {
      setError('Could not fetch weather. Check internet connection.')
      console.error('Weather fetch error:', e)
    }
    setLoading(false)
  }

  // ── Derive values from OpenWeather response ─────────────────────────
  const temp        = weather ? Math.round(weather.main?.temp)        : '--'
  const feelsLike   = weather ? Math.round(weather.main?.feels_like)  : '--'
  const humidity    = weather ? weather.main?.humidity                 : '--'
  const windSpeed   = weather ? Math.round(weather.wind?.speed * 3.6) : '--' // m/s → km/h
  const visibility  = weather ? Math.round((weather.visibility||0)/1000) : '--'
  const pressure    = weather ? weather.main?.pressure                 : '--'
  const description = weather ? weather.weather?.[0]?.description      : ''
  const iconCode    = weather ? weather.weather?.[0]?.icon             : ''
  const cityName    = weather ? weather.name                           : 'Loading...'
  const country     = weather ? weather.sys?.country                   : ''
  const advice      = weather ? getFarmingAdvice(weather)              : []

  // Sunrise / sunset
  const sunrise = weather
    ? new Date(weather.sys.sunrise * 1000).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})
    : '--'
  const sunset = weather
    ? new Date(weather.sys.sunset  * 1000).toLocaleTimeString('en-IN', {hour:'2-digit', minute:'2-digit'})
    : '--'

  return (
    <div style={{ padding:'16px 16px 32px' }}>
      <h2 style={{ fontSize:22, fontWeight:900, color:'#064e3b', marginBottom:4 }}>
        🌤 Weather Advisory
      </h2>
      <p style={{ fontSize:13, color:'#6b7280', marginBottom:18 }}>
        Real-time data for your location
      </p>

      {/* ── Loading ── */}
      {loading && (
        <div style={{
          background:'#fff', borderRadius:16, padding:40,
          textAlign:'center', boxShadow:'0 2px 8px rgba(0,0,0,.06)',
        }}>
          <div style={{ fontSize:40, marginBottom:12,
            animation:'spin 1s linear infinite', display:'inline-block' }}>⟳</div>
          <div style={{ color:'#6b7280', fontSize:14 }}>Fetching live weather...</div>
          <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div>
          <div style={{
            background:'#fef2f2', border:'1px solid #fca5a5',
            borderRadius:12, padding:14, marginBottom:14,
            color:'#dc2626', fontSize:13,
          }}>
            ❌ {error}
          </div>
          <button
            onClick={fetchWeather}
            style={{
              width:'100%', padding:'12px 0', borderRadius:50,
              background:'#059669', color:'#fff', border:'none',
              fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit',
            }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {/* ── Weather data ── */}
      {weather && !loading && (
        <>
          {/* Main weather card */}
          <div style={{
            background:'linear-gradient(135deg,#1d4ed8,#3b82f6,#60a5fa)',
            borderRadius:20, padding:24, color:'#fff',
            marginBottom:16, position:'relative', overflow:'hidden',
          }}>
            {/* Background emoji */}
            <div style={{
              position:'absolute', right:-10, top:-10,
              fontSize:100, opacity:0.15, lineHeight:1,
            }}>
              {getWeatherEmoji(iconCode)}
            </div>

            {/* Location */}
            <div style={{ fontSize:13, opacity:0.85, marginBottom:8, fontWeight:600 }}>
              📍 {cityName}{country ? `, ${country}` : ''}
            </div>

            {/* Temp + description */}
            <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:16 }}>
              <div style={{ fontSize:72, fontWeight:900, lineHeight:1 }}>{temp}°</div>
              <div style={{ paddingBottom:8 }}>
                <div style={{ fontSize:40 }}>{getWeatherEmoji(iconCode)}</div>
                <div style={{ fontSize:14, opacity:0.9, textTransform:'capitalize' }}>
                  {description}
                </div>
                <div style={{ fontSize:12, opacity:0.75 }}>
                  Feels like {feelsLike}°C
                </div>
              </div>
            </div>

            {/* Alert box */}
            {advice.length > 0 && (
              <div style={{
                background:'rgba(255,255,255,0.18)',
                borderRadius:12, padding:'10px 14px',
              }}>
                <div style={{ fontSize:11, opacity:0.8, fontWeight:700, marginBottom:4 }}>
                  💡 FARMING ALERT
                </div>
                <div style={{ fontSize:13, lineHeight:1.5 }}>{advice[0]}</div>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div style={{
            background:'#fff', borderRadius:16, padding:16,
            boxShadow:'0 2px 8px rgba(0,0,0,.06)', marginBottom:16,
          }}>
            <div style={{ fontWeight:800, color:'#064e3b', marginBottom:12, fontSize:15 }}>
              📊 Current Conditions
            </div>
            <div style={{ display:'flex', gap:10, marginBottom:10 }}>
              <StatCard icon="💧" label="Humidity"   value={humidity}   unit="%"    bg="#eff6ff" color="#1d4ed8" />
              <StatCard icon="💨" label="Wind"       value={windSpeed}  unit="km/h" bg="#f0fdf4" color="#059669" />
              <StatCard icon="👁️" label="Visibility" value={visibility} unit="km"   bg="#fffbeb" color="#f59e0b" />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <StatCard icon="🌡" label="Pressure"  value={pressure} unit="hPa" bg="#fdf2f8" color="#9333ea" />
              <StatCard icon="🌅" label="Sunrise"   value={sunrise}  unit=""    bg="#fff7ed" color="#ea580c" />
              <StatCard icon="🌇" label="Sunset"    value={sunset}   unit=""    bg="#fef2f2" color="#dc2626" />
            </div>
          </div>

          {/* All farming advice */}
          <div style={{
            background:'#fff', borderRadius:16, padding:16,
            boxShadow:'0 2px 8px rgba(0,0,0,.06)', marginBottom:16,
          }}>
            <div style={{ fontWeight:800, color:'#064e3b', marginBottom:14, fontSize:15 }}>
              🌾 Farming Advisory
            </div>
            {advice.map((a, i) => (
              <div key={i} style={{
                display:'flex', gap:10, alignItems:'flex-start',
                padding:'8px 0',
                borderBottom: i < advice.length-1 ? '1px solid #f3f4f6' : 'none',
              }}>
                <div style={{
                  width:26, height:26, borderRadius:'50%',
                  background:'#ecfdf5', border:'2px solid #059669',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:900, color:'#059669', flexShrink:0,
                }}>{i+1}</div>
                <span style={{ fontSize:13, color:'#374151', lineHeight:1.5 }}>{a}</span>
              </div>
            ))}
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchWeather}
            style={{
              width:'100%', padding:'12px 0', borderRadius:50,
              background:'transparent', border:'2px solid #059669',
              color:'#059669', fontSize:14, fontWeight:700,
              cursor:'pointer', fontFamily:'inherit',
            }}
          >
            🔄 Refresh Weather
          </button>

          <div style={{
            marginTop:12, textAlign:'center', fontSize:11, color:'#9ca3af',
          }}>
            Updated: {new Date(weather.dt * 1000).toLocaleTimeString('en-IN', {
              hour:'2-digit', minute:'2-digit'
            })} · Source: OpenWeather
          </div>
        </>
      )}
    </div>
  )
}