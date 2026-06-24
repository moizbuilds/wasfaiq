import Anthropic from '@anthropic-ai/sdk'

const JAIS_ENDPOINT = 'https://api.ai71.ai/v1/chat/completions'
const JAIS_MODEL = 'jais-adapted-70b-chat'

const SYSTEM_PROMPT = `You are a Gulf Arabic cooking expert. You adapt international recipes for home cooks in Qatar, UAE, Saudi Arabia, and Kuwait. You know exactly what is available in Carrefour, Lulu Hypermarket, and Al Meera supermarkets. You write in warm, practical Gulf Arabic (خليجي). When adapting recipes:
- Replace pork with lamb or chicken
- Replace hard-to-find Western cheeses with Almarai or Puck equivalents
- Replace alcohol in sauces with pomegranate molasses, grape juice, or broth
- Replace seasonal Western produce with Gulf supermarket equivalents
- Keep substitution notes brief and practical`

function buildPrompt(recipeText) {
  return `Here is a recipe:

${recipeText}

Adapt this recipe for a Gulf Arab home cook. Return ONLY raw JSON — no markdown, no code fences, no explanation. Use this exact shape:
{
  "title_en": "Recipe name in English",
  "title_ar": "اسم الوصفة بالعربي",
  "ingredients_original": ["ingredient 1", "ingredient 2"],
  "ingredients_adapted": [
    { "original": "original ingredient", "substitute": "Gulf substitute", "note_ar": "ملاحظة قصيرة" }
  ],
  "steps_en": ["Step 1 in English", "Step 2 in English"],
  "steps_ar": ["الخطوة الأولى", "الخطوة الثانية"],
  "gulf_context_ar": "فقرة قصيرة بالعربي الخليجي عن هذه الوصفة وكيف تناسب المطبخ الخليجي"
}`
}

// Try JAIS first. If it fails or returns bad JSON, fall back to Claude Haiku.
export async function adaptWithJais(recipeText, jaisKey, anthropicKey) {
  // Attempt 1: JAIS
  if (jaisKey) {
    try {
      const res = await fetch(JAIS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jaisKey}` },
        body: JSON.stringify({
          model: JAIS_MODEL,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildPrompt(recipeText) },
          ],
          max_tokens: 2000,
          temperature: 0.3,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        const text = json.choices?.[0]?.message?.content?.trim()
        if (text) {
          const parsed = JSON.parse(text)
          if (parsed.title_ar && parsed.steps_ar) return parsed
        }
      }
    } catch (e) {
      console.warn('[jais] failed, falling back to Haiku:', e.message)
    }
  }

  // Attempt 2: Claude Haiku fallback
  const client = new Anthropic({ apiKey: anthropicKey })
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildPrompt(recipeText) }],
  })
  const text = message.content[0].text.trim()
  return JSON.parse(text)
}
