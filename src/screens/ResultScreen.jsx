import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import BilingualResult from '../components/BilingualResult'

export default function ResultScreen({ data, onNavigate }) {
  const { user, session } = useAuth()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  if (!data) {
    return (
      <div style={{ padding: 32, textAlign: 'center' }}>
        <p>No result to show. <button onClick={() => onNavigate('home')} style={{ color: '#c8860a', background: 'none', border: 'none', cursor: 'pointer' }}>Go back</button></p>
      </div>
    )
  }

  const { original, adapted, sourceType, sourceUrl } = data

  async function handleSave() {
    if (!user) { onNavigate('auth'); return }
    setSaving(true)
    setSaveError(null)
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: adapted.title_en || original.title,
          sourceUrl,
          sourceType,
          original,
          adapted,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSaved(true)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function handleCopyArabic() {
    const text = [
      adapted.title_ar,
      '',
      'المكونات:',
      ...adapted.ingredients_adapted.map(i => `- ${i.substitute}`),
      '',
      'طريقة التحضير:',
      ...adapted.steps_ar.map((s, i) => `${i + 1}. ${s}`),
    ].join('\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 32px 80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button
          onClick={() => onNavigate('home')}
          style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: 14 }}
        >
          ← New recipe
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleCopyArabic}
            style={{ padding: '8px 16px', background: 'none', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Copy Arabic
          </button>
          {saved ? (
            <span style={{ padding: '8px 16px', color: '#27ae60', fontSize: 14, fontWeight: 600 }}>✓ Saved</span>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ padding: '8px 16px', background: '#c8860a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
            >
              {saving ? 'Saving…' : user ? 'Save to Collection' : 'Sign in to Save'}
            </button>
          )}
        </div>
      </div>
      {saveError && <p style={{ color: 'red', fontSize: 13, marginBottom: 8 }}>{saveError}</p>}
      <BilingualResult original={original} adapted={adapted} />
    </div>
  )
}
