import { useState } from 'react'

const TYPE_ICONS = { url: '🔗', tiktok: '🎵', instagram: '📸' }

export default function RecipeListItem({ recipe, onClick }) {
  const [hovered, setHovered] = useState(false)
  const date = new Date(recipe.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '16px 20px',
        background: hovered ? '#fff8ec' : '#fff',
        border: '1px solid #e8dcc8', borderRadius: 12, cursor: 'pointer',
        textAlign: 'left', marginBottom: 10,
        transition: 'background 0.12s, box-shadow 0.12s',
        boxShadow: hovered ? '0 2px 8px rgba(200,134,10,0.10)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 20 }}>{TYPE_ICONS[recipe.source_type] || '🍽️'}</span>
        <div>
          <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 16 }}>{recipe.title}</div>
          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: '#fff8ec',
              border: '1px solid #e8dcc8',
              borderRadius: 10,
              padding: '2px 8px',
              fontSize: 12,
              color: '#c8860a',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            }}>
              {recipe.source_type}
            </span>
            <span style={{ fontSize: 13, color: '#999' }}>{date}</span>
          </div>
        </div>
      </div>
      <span style={{ color: '#c8860a', fontSize: 20 }}>→</span>
    </button>
  )
}
