import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Get the user's auth token from the Authorization header
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  // Use the service key to bypass RLS for the insert, but first verify the
  // user's JWT to get their user_id — so we only save to the right account
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return res.status(401).json({ error: 'Invalid token' })

  const { title, sourceUrl, sourceType, original, adapted } = req.body
  if (!title || !sourceType || !original || !adapted) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const { data, error } = await supabase
    .from('recipes')
    .insert({
      user_id:       user.id,
      title,
      source_url:    sourceUrl || null,
      source_type:   sourceType,
      original_json: original,
      adapted_json:  adapted,
    })
    .select('id')
    .single()

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ id: data.id })
}
