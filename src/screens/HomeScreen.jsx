import { useState } from 'react'
import { detectInputType } from '../lib/detect'

const TYPE_LABELS = {
  tiktok: '🎵 TikTok video detected',
  instagram: '📸 Instagram Reel detected',
  url: '🔗 Recipe URL detected',
  unknown: '',
}

const STEPS = {
  scraping: 'Scraping video…',
  extracting: 'Extracting recipe…',
  adapting: 'Adapting for Gulf…',
}

const PROCESSING_STYLES = `
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
@keyframes progress {
  0% { width: 0%; }
  100% { width: 100%; }
}
.processing-emoji {
  animation: pulse 1.5s ease-in-out infinite;
}
.progress-bar {
  animation: progress 8s linear forwards;
}
`

export default function HomeScreen({ onResult }) {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState('unknown')
  const [stage, setStage] = useState(null) // null | 'scraping' | 'extracting' | 'adapting'
  const [error, setError] = useState(null)
  const [inputFocused, setInputFocused] = useState(false)

  function handleInputChange(e) {
    const val = e.target.value
    setInput(val)
    setInputType(detectInputType(val))
    setError(null)
  }

  async function pollScrapeStatus(jobId, datasetId, type) {
    const deadline = Date.now() + 120000 // 2 min timeout
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 3000))
      const res = await fetch(`/api/scrape-status?jobId=${jobId}&datasetId=${datasetId}&type=${type}`)
      const data = await res.json()
      if (data.status === 'done') return data.recipeText
      if (data.status === 'failed') throw new Error(data.error || 'Scraping failed')
    }
    throw new Error('Timed out waiting for video scrape')
  }

  async function handleAdapt() {
    setError(null)
    const type = detectInputType(input)
    if (type === 'unknown') { setError('Please paste a recipe URL, TikTok link, or Instagram Reel link'); return }

    try {
      let recipeText = null

      if (type === 'tiktok' || type === 'instagram') {
        setStage('scraping')
        const scrapeRes = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: input, type }),
        })
        const scrapeData = await scrapeRes.json()
        if (!scrapeRes.ok) throw new Error(scrapeData.error || 'Scraping failed')
        recipeText = await pollScrapeStatus(scrapeData.jobId, scrapeData.datasetId, type)
        setStage('extracting')
      } else {
        setStage('extracting')
      }

      setStage('adapting')
      const adaptRes = await fetch('/api/adapt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeText, sourceUrl: type === 'url' ? input : null, sourceType: type }),
      })
      const adaptData = await adaptRes.json()
      if (!adaptRes.ok) throw new Error(adaptData.error || 'Adaptation failed')

      setStage(null)
      onResult({ ...adaptData, sourceUrl: input })
    } catch (err) {
      setStage(null)
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '80px auto', padding: 32, textAlign: 'center', background: '#fffbf5', minHeight: '100vh' }}>
      <style>{PROCESSING_STYLES}</style>
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
        وصفة IQ
      </h1>
      <p style={{ color: '#666', marginBottom: 48, fontSize: 17 }}>
        Paste a recipe link — get a Gulf-adapted Arabic version instantly
      </p>

      {stage ? (
        <div style={{ padding: 48, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="processing-emoji" style={{ fontSize: 48, marginBottom: 20 }}>⏳</div>
          <div style={{ fontSize: 18, color: '#c8860a', fontWeight: 600, marginBottom: 16 }}>
            {STEPS[stage]}
          </div>
          <div style={{ width: '100%', maxWidth: 320, background: '#f0e8d8', borderRadius: 2, overflow: 'hidden' }}>
            <div
              className="progress-bar"
              style={{ height: 3, background: '#c8860a', borderRadius: 2, width: 0 }}
            />
          </div>
        </div>
      ) : (
        <div style={{
          background: '#fff',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '1px solid #f0e8d8',
          textAlign: 'left',
        }}>
          {inputType !== 'unknown' && input && (
            <div style={{
              background: '#fff8ec',
              border: '1px solid #e8dcc8',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 13,
              color: '#c8860a',
              display: 'inline-block',
              marginBottom: 12,
            }}>
              {TYPE_LABELS[inputType]}
            </div>
          )}
          <input
            type="url"
            value={input}
            onChange={handleInputChange}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Paste recipe URL, TikTok, or Instagram link…"
            style={{
              width: '100%',
              padding: '18px 22px',
              fontSize: 17,
              border: `2px solid ${inputFocused ? '#c8860a' : '#e8dcc8'}`,
              borderRadius: 16,
              outline: 'none',
              background: '#fff',
              marginBottom: 8,
              boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
          />
          {error && (
            <p style={{ color: '#c0392b', fontSize: 14, marginBottom: 12 }}>{error}</p>
          )}
          <button
            onClick={handleAdapt}
            disabled={!input || inputType === 'unknown'}
            style={{
              width: '100%',
              padding: '16px',
              background: '#c8860a',
              color: '#fff',
              border: 'none',
              borderRadius: 14,
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: '0.3px',
              cursor: input && inputType !== 'unknown' ? 'pointer' : 'not-allowed',
              opacity: input && inputType !== 'unknown' ? 1 : 0.5,
              transition: 'opacity 0.15s',
            }}
          >
            Adapt Recipe →
          </button>
        </div>
      )}
    </div>
  )
}
