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

export default function HomeScreen({ onResult }) {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState('unknown')
  const [stage, setStage] = useState(null) // null | 'scraping' | 'extracting' | 'adapting'
  const [error, setError] = useState(null)

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
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>
        وصفة IQ
      </h1>
      <p style={{ color: '#666', marginBottom: 48, fontSize: 17 }}>
        Paste a recipe link — get a Gulf-adapted Arabic version instantly
      </p>

      {stage ? (
        <div style={{ padding: 48, color: '#c8860a', fontSize: 18 }}>
          <div style={{ marginBottom: 16, fontSize: 32 }}>⏳</div>
          {STEPS[stage]}
        </div>
      ) : (
        <>
          <input
            type="url"
            value={input}
            onChange={handleInputChange}
            placeholder="Paste recipe URL, TikTok, or Instagram link…"
            style={{
              width: '100%', padding: '16px 20px', fontSize: 16,
              border: '2px solid #e8dcc8', borderRadius: 12, outline: 'none',
              background: '#fff', marginBottom: 8, boxSizing: 'border-box',
            }}
          />
          {inputType !== 'unknown' && input && (
            <p style={{ color: '#c8860a', fontSize: 14, marginBottom: 12 }}>
              {TYPE_LABELS[inputType]}
            </p>
          )}
          {error && (
            <p style={{ color: '#c0392b', fontSize: 14, marginBottom: 12 }}>{error}</p>
          )}
          <button
            onClick={handleAdapt}
            disabled={!input || inputType === 'unknown'}
            style={{
              width: '100%', padding: '16px', background: '#c8860a', color: '#fff',
              border: 'none', borderRadius: 12, fontSize: 18, fontWeight: 600,
              cursor: input && inputType !== 'unknown' ? 'pointer' : 'not-allowed',
              opacity: input && inputType !== 'unknown' ? 1 : 0.5,
            }}
          >
            Adapt Recipe →
          </button>
        </>
      )}
    </div>
  )
}
