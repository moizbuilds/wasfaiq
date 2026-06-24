export default function BilingualResult({ original, adapted }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32 }}>
      {/* Left column: English original */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#1a1a1a' }}>
          {original.title}
        </h2>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Ingredients
        </h3>
        <ul style={{ listStyle: 'none', marginBottom: 24 }}>
          {original.ingredients.map((ing, i) => (
            <li key={i} style={{ padding: '6px 0', borderBottom: '1px solid #f0e8d8', fontSize: 15, color: '#333' }}>
              {ing}
            </li>
          ))}
        </ul>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Steps
        </h3>
        <ol style={{ paddingLeft: 20 }}>
          {original.steps.map((step, i) => (
            <li key={i} style={{ marginBottom: 10, fontSize: 15, color: '#333', lineHeight: 1.6 }}>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Right column: Arabic Gulf adaptation — RTL */}
      <div dir="rtl" style={{ background: '#fffbf0', borderRadius: 16, padding: 24, border: '1px solid #e8dcc8' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#c8860a' }}>
          {adapted.title_ar}
        </h2>
        <p style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>{adapted.title_en}</p>

        {adapted.gulf_context_ar && (
          <p style={{ fontSize: 15, color: '#555', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
            {adapted.gulf_context_ar}
          </p>
        )}

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#999', marginBottom: 10 }}>
          المكونات المكيّفة
        </h3>
        <ul style={{ listStyle: 'none', marginBottom: 24 }}>
          {adapted.ingredients_adapted.map((ing, i) => (
            <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #e8dcc8' }}>
              <span style={{ fontSize: 15, color: '#1a1a1a' }}>{ing.substitute}</span>
              {ing.original !== ing.substitute && (
                <span style={{ fontSize: 13, color: '#999', marginRight: 8 }}>
                  (بدلاً من: {ing.original})
                </span>
              )}
              {ing.note_ar && (
                <div style={{ fontSize: 13, color: '#c8860a', marginTop: 2 }}>{ing.note_ar}</div>
              )}
            </li>
          ))}
        </ul>

        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#999', marginBottom: 10 }}>
          طريقة التحضير
        </h3>
        <ol style={{ paddingRight: 20, paddingLeft: 0 }}>
          {adapted.steps_ar.map((step, i) => (
            <li key={i} style={{ marginBottom: 10, fontSize: 15, color: '#333', lineHeight: 1.7 }}>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
