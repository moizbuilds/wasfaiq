import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import RecipeListItem from '../components/RecipeListItem'

export default function CollectionScreen({ onSelect }) {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('recipes')
      .select('id, title, source_type, source_url, original_json, adapted_json, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        setLoading(false)
        if (error) { setError(error.message); return }
        setRecipes(data || [])
      })
  }, [user])

  if (!user) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#666' }}>
        Sign in to see your saved recipes.
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '48px auto', padding: '0 32px' }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>My Recipes</h2>
      {loading && <p style={{ color: '#999' }}>Loading…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && recipes.length === 0 && (
        <p style={{ color: '#999' }}>No saved recipes yet. Adapt one from the home screen!</p>
      )}
      {recipes.map(recipe => (
        <RecipeListItem
          key={recipe.id}
          recipe={recipe}
          onClick={() => onSelect({
            original: recipe.original_json,
            adapted: recipe.adapted_json,
            sourceType: recipe.source_type,
            sourceUrl: recipe.source_url,
          })}
        />
      ))}
    </div>
  )
}
