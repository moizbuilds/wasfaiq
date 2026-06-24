import { getRunStatus, getDatasetItems } from './_apify.js'

// Extracts recipe-relevant text from Apify's raw output.
// TikTok returns: item.text (caption/description)
// Instagram returns: item.caption or item.text
function extractTextFromItems(items, type) {
  if (!items?.length) return null
  const item = items[0]
  return item.text || item.caption || item.description || null
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { jobId, datasetId, type } = req.query
  if (!jobId || !datasetId) return res.status(400).json({ error: 'jobId and datasetId are required' })

  const token = process.env.APIFY_TOKEN
  if (!token) return res.status(500).json({ error: 'APIFY_TOKEN not configured' })

  try {
    const status = await getRunStatus(jobId, token)

    if (status === 'RUNNING' || status === 'READY') {
      return res.status(200).json({ status: 'running' })
    }

    if (status !== 'SUCCEEDED') {
      return res.status(200).json({ status: 'failed', error: `Apify run ${status}` })
    }

    const items = await getDatasetItems(datasetId, token)
    const recipeText = extractTextFromItems(items, type)

    if (!recipeText) {
      return res.status(200).json({ status: 'failed', error: 'No text found in scraped content' })
    }

    return res.status(200).json({ status: 'done', recipeText })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
