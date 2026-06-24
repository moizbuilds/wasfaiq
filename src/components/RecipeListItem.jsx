const TYPE_ICONS = { url: '🔗', tiktok: '🎵', instagram: '📸' }

export default function RecipeListItem({ recipe, onClick }) {
  const date = new Date(recipe.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '16px 20px', background: '#fff',
        border: '1px solid #e8dcc8', borderRadius: 12, cursor: 'pointer',
        textAlign: 'left', marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 20 }}>{TYPE_ICONS[recipe.source_type] || '🍽️'}</span>
        <div>
          <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 15 }}>{recipe.title}</div>
          <div style={{ fontSize: 13, color: '#999', marginTop: 2 }}>
            {recipe.source_type.toUpperCase()} · {date}
          </div>
        </div>
      </div>
      <span style={{ color: '#c8860a', fontSize: 18 }}>→</span>
    </button>
  )
}
