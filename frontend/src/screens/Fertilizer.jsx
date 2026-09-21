import { useState, useEffect } from 'react'
import { getFertilizerAdvisory, speakText } from '../utils/api.js'

export default function Fertilizer() {
  const [cropsData, setCropsData] = useState(null)
  const [selectedCrop, setSelectedCrop] = useState('Tomato')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('stages') // 'stages' | 'organic'

  useEffect(() => {
    const fetchAdvisory = async () => {
      try {
        setLoading(true)
        const data = await getFertilizerAdvisory()
        setCropsData(data)
      } catch (err) {
        console.error('Failed to load fertilizer advisory:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAdvisory()
  }, [])

  const currentCropSchedule = cropsData?.crops?.[selectedCrop]
  const organicGuide = cropsData?.general_organic_guide

  const playAudio = (text) => {
    if (!text) return
    const url = speakText(text, 'te')
    const audio = new Audio(url)
    audio.play().catch(e => console.log('Audio playback error:', e))
  }

  return (
    <div style={{ padding: '16px 16px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#064e3b', margin: 0 }}>
          🌱 Fertilizer & Soil Care
        </h2>
        {currentCropSchedule?.telugu_summary && (
          <button
            onClick={() => playAudio(currentCropSchedule.telugu_summary)}
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: 20,
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 700,
              color: '#047857',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            🔊 తెలుగు
          </button>
        )}
      </div>

      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
        Agronomic nutrient schedules, dosage & natural bio-fertilizers
      </p>

      {/* Crop Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        marginBottom: 16,
        background: '#e5e7eb',
        padding: 4,
        borderRadius: 12
      }}>
        {['Tomato', 'Potato', 'Pepper'].map((crop) => (
          <button
            key={crop}
            onClick={() => setSelectedCrop(crop)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              background: selectedCrop === crop ? '#059669' : 'transparent',
              color: selectedCrop === crop ? '#fff' : '#374151',
              transition: 'all 0.2s'
            }}
          >
            {crop === 'Tomato' ? '🍅 Tomato' : crop === 'Potato' ? '🥔 Potato' : '🫑 Pepper'}
          </button>
        ))}
      </div>

      {/* View Switcher: Stages vs Organic Formulations */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <button
          onClick={() => setViewMode('stages')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            border: '2px solid',
            borderColor: viewMode === 'stages' ? '#059669' : '#e5e7eb',
            background: viewMode === 'stages' ? '#ecfdf5' : '#fff',
            color: viewMode === 'stages' ? '#065f46' : '#6b7280',
            cursor: 'pointer'
          }}
        >
          📅 Crop Stage Schedule
        </button>
        <button
          onClick={() => setViewMode('organic')}
          style={{
            flex: 1,
            padding: '8px 10px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            border: '2px solid',
            borderColor: viewMode === 'organic' ? '#059669' : '#e5e7eb',
            background: viewMode === 'organic' ? '#ecfdf5' : '#fff',
            color: viewMode === 'organic' ? '#065f46' : '#6b7280',
            cursor: 'pointer'
          }}
        >
          🌿 Bio-Stimulants & Recipes
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: '#6b7280' }}>
          Loading fertilizer recommendations...
        </div>
      ) : viewMode === 'stages' ? (
        <div>
          {/* NPK Summary Card */}
          <div style={{
            background: 'linear-gradient(135deg, #064e3b, #059669)',
            color: '#fff',
            borderRadius: 16,
            padding: '16px 18px',
            marginBottom: 16,
            boxShadow: '0 4px 12px rgba(5,150,105,0.2)'
          }}>
            <div style={{ fontSize: 12, opacity: 0.9, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Standard NPK Ratio
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 4 }}>
              {currentCropSchedule?.npk_ratio || '120:80:100 kg/ha'}
            </div>
            {currentCropSchedule?.telugu_summary && (
              <div style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.2)',
                fontSize: 13,
                lineHeight: 1.4,
                opacity: 0.95
              }}>
                📢 {currentCropSchedule.telugu_summary}
              </div>
            )}
          </div>

          {/* Stage Cards */}
          {currentCropSchedule?.stages?.map((stage, idx) => (
            <div
              key={idx}
              style={{
                background: '#fff',
                borderRadius: 16,
                padding: 16,
                marginBottom: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                borderLeft: '5px solid #10b981'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{
                  background: '#10b981',
                  color: '#fff',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 800
                }}>
                  {idx + 1}
                </span>
                <div style={{ fontWeight: 800, color: '#064e3b', fontSize: 15 }}>
                  {stage.stage}
                </div>
              </div>

              {/* Chemical recommendation */}
              <div style={{ marginBottom: 10, background: '#f8fafc', padding: '10px 12px', borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', marginBottom: 2 }}>
                  🧪 Chemical Dosage (Per Acre):
                </div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>
                  {stage.chemical}
                </div>
              </div>

              {/* Organic recommendation */}
              <div style={{ marginBottom: 10, background: '#f0fdf4', padding: '10px 12px', borderRadius: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 2 }}>
                  🍃 Organic Alternative:
                </div>
                <div style={{ fontSize: 13, color: '#166534', lineHeight: 1.4 }}>
                  {stage.organic}
                </div>
              </div>

              {/* Agronomic Tip */}
              <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', display: 'flex', gap: 6 }}>
                <span>💡</span>
                <span>{stage.tips}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Organic Recipes View */
        <div>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 18,
            marginBottom: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
              🌿 Jeevamrutha (జీవామృతం)
            </div>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: 0 }}>
              {organicGuide?.jeevamrutha ||
                '200L water + 10kg fresh desi cow dung + 5-10L cow urine + 2kg jaggery + 2kg gram flour (besan) + handful of fertile soil. Ferment for 48 hours under shade.'}
            </p>
            <div style={{ marginTop: 10, fontSize: 12, color: '#047857', fontWeight: 600 }}>
              ✨ Promotes soil microbes and accelerates root growth.
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 18,
            marginBottom: 14,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
              🍃 Neem Astra (వేపాస్త్రం)
            </div>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: 0 }}>
              {organicGuide?.neem_astra ||
                '100L water + 5kg crushed neem leaves/seeds + 5L cow urine + 1kg cow dung. Ferment 48 hrs. Highly effective against aphids, thrips, and caterpillars.'}
            </p>
            <div style={{ marginTop: 10, fontSize: 12, color: '#047857', fontWeight: 600 }}>
              ✨ 100% natural pesticide and anti-fungal deterrent.
            </div>
          </div>

          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 18,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46', marginBottom: 8 }}>
              🥛 Fermented Buttermilk Spray (పుల్లటి మజ్జిగ)
            </div>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, margin: 0 }}>
              Mix 500ml sour buttermilk in 10-15 Litres of water. Spray during early flowering and fruit setting stages.
            </p>
            <div style={{ marginTop: 10, fontSize: 12, color: '#047857', fontWeight: 600 }}>
              ✨ Natural fungicide and prevents premature blossom drop.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
