import { adaptWithJais } from './_jais.js'

// Tries to fetch and extract a recipe from a URL.
// First tries recipe-scraper (works on major sites).
// Falls back to fetching raw HTML and asking Claude to extract it.
async function extractFromUrl(url, anthropicKey) {
  // Attempt 1: recipe-scraper
  try {
    const { default: scrapeRecipe } = await import('recipe-scraper')
    const recipe = await scrapeRecipe(url)
    if (recipe?.ingredients?.length && recipe?.instructions?.length) {
      return `Title: ${recipe.name || 'Recipe'}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nSteps:\n${recipe.instructions.join('\n')}`
    }
  } catch (e) {
    console.warn('[extract] recipe-scraper failed:', e.message)
  }

  // Attempt 2: fetch HTML + Claude extraction
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const htmlRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!htmlRes.ok) throw new Error(`Could not fetch URL: ${htmlRes.status}`)
  const html = await htmlRes.text()
  // Trim HTML to first 50k chars to avoid hitting token limits
  const trimmed = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                      .replace(/<[^>]+>/g, ' ')
                      .replace(/\s+/g, ' ')
                      .slice(0, 50000)

  const client = new Anthropic({ apiKey: anthropicKey })
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Extract the recipe from this webpage text. Return only: Title, Ingredients (one per line), Steps (one per line). If there is no recipe, say "NO_RECIPE".\n\n${trimmed}`,
    }],
  })
  const extracted = msg.content[0].text.trim()
  if (extracted === 'NO_RECIPE') throw new Error('No recipe found on that page')
  return extracted
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { recipeText, sourceUrl, sourceType = 'url' } = req.body
  if (!recipeText && !sourceUrl) {
    return res.status(400).json({ error: 'Provide either recipeText or sourceUrl' })
  }

  const jaisKey = process.env.JAIS_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (!anthropicKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })

  try {
    const text = recipeText || await extractFromUrl(sourceUrl, anthropicKey)
    const adapted = await adaptWithJais(text, jaisKey, anthropicKey)

    // Build the "original" object from the adapted result's _en fields
    const original = {
      title: adapted.title_en,
      ingredients: adapted.ingredients_original,
      steps: adapted.steps_en,
    }

    return res.status(200).json({ original, adapted, sourceType })
  } catch (err) {
    console.error('[adapt] error:', err)
    return res.status(500).json({ error: err.message })
  }
}
